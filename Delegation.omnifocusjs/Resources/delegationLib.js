/* global PlugIn Version Task moveTasks Form Calendar */
(() => {
  const delegationLib = new PlugIn.Library(new Version('1.0'))

  delegationLib.loadSyncedPrefs = () => {
    const syncedPrefsPlugin = PlugIn.find('com.KaitlinSalzke.SyncedPrefLibrary')

    if (syncedPrefsPlugin !== null) {
      const SyncedPref = syncedPrefsPlugin.library('syncedPrefLibrary').SyncedPref
      return new SyncedPref('com.KaitlinSalzke.Delegation')
    } else {
      const alert = new Alert(
        'Synced Preferences Library Required',
        'For the Delegation plug-in to work correctly, the \'Synced Preferences for OmniFocus\' plugin(https://github.com/ksalzke/synced-preferences-for-omnifocus) is also required and needs to be added to the plug-in folder separately. Either you do not currently have this plugin installed, or it is not installed correctly.'
      )
      alert.show()
    }
  }

  delegationLib.getWaitingTag = () => {
    console.log('getting waiting tag')
    const preferences = delegationLib.loadSyncedPrefs()
    console.log('got synced prefs')
    const tagID = preferences.readString('waitingTagID')

    if (tagID !== null) return Tag.byIdentifier(tagID)
    else return null
  }

  delegationLib.followUp = (selectedTasks) => {
    const config = PlugIn.find('com.KaitlinSalzke.Delegation').library(
      'delegationConfig'
    )

    // configure tags
    const waitingTag = config.waitingTag()
    const followUpMethods = config.followUpMethods()
    const defaultFollowUpMethod = config.defaultFollowUpMethod()

    // uninherited tags to be removed
    let uninheritedTags = config.uninheritedTags()

    // also remove tags that are children of waiting tag
    uninheritedTags = [...uninheritedTags, ...waitingTag.children, waitingTag]

    const functionLibrary = PlugIn.find('com.KaitlinSalzke.functionLibrary').library(
      'functionLibrary'
    )

    function addFollowUpTask (taskArray, contactMethod) {
      taskArray.forEach((task) => {
        // get parent task
        let parentTask = functionLibrary.getParent(task)

        if (!/^Waiting for: /.test(parentTask.name)) {
          // add parent action group
          parentTask = new Task(task.name, task.before)
        }

        // move original task inside group
        moveTasks([task], parentTask.ending)

        // replace "Waiting for: " with "Follow up: " in task name
        const followUpTaskName = task.name.replace(
          /^(?:Waiting for: )*/,
          'Follow up: '
        )

        // create task and add relevant tags and link to original task
        const followUpTask = new Task(followUpTaskName, task.before)
        followUpTask.addTag(contactMethod)
        followUpTask.addTags(task.tags)
        followUpTask.removeTags(uninheritedTags)
        followUpTask.note =
          '[FOLLOWUPON: omnifocus:///task/' + task.id.primaryKey + ']'
        followUpTask.dueDate = task.effectiveDueDate
        followUpTask.flagged = task.effectiveFlagged

        // make the group sequential
        parentTask.sequential = true
      })
    }

    if (followUpMethods.length > 1) {
      // show form to select follow up method
      const inputForm = new Form()
      const popupMenu = new Form.Field.Option(
        'contactMethod',
        'Contact Method',
        followUpMethods,
        followUpMethods.map((tag) => tag.name),
        defaultFollowUpMethod
      )

      inputForm.addField(popupMenu)

      const formPrompt = 'Select contact method:'
      const formPromise = inputForm.show(formPrompt, 'Continue')

      inputForm.validate = function (formObject) {
        const validation = true
        return validation
      }

      // process results from form selection
      formPromise.then(function (formObject) {
        addFollowUpTask(selectedTasks, formObject.values.contactMethod)
      })

      // log error if form is cancelled
      formPromise.catch(function (err) {
        console.log('form cancelled', err.message)
      })
    } else {
      addFollowUpTask(selectedTasks, defaultFollowUpMethod)
    }
  }

  delegationLib.noteFollowUp = (task) => {
    // if 'Follow up' task, make a note on original task when followed up on
    if (/[fF]ollow up/.test(task.name)) {
      const originalTaskRegex = /\[FOLLOWUPON: omnifocus:\/\/\/task\/(.+)\]/g
      const originalTaskRegexResult = originalTaskRegex.exec(task.note)

      if (originalTaskRegexResult !== null) {
        const originalTaskId = originalTaskRegexResult[1]
        const originalTask = Task.byIdentifier(originalTaskId)

        const now = new Date()

        originalTask.note = `${
          originalTask.note
        }\n\nFollowed up ${now.toString()}`
      }
    }
  }

  delegationLib.followUpDueToday = () => {
    // configuration
    const config = PlugIn.find('com.KaitlinSalzke.Delegation').library(
      'delegationConfig'
    )
    const waitingTag = config.waitingTag()

    const today = Calendar.current.startOfDay(new Date())

    const dueToday = []
    waitingTag.remainingTasks.forEach((task) => {
      if (
        task.effectiveDueDate !== null &&
        Calendar.current.startOfDay(task.effectiveDueDate).getTime() ===
          today.getTime()
      ) {
        dueToday.push(task)
      }
    })

    if (dueToday.length > 0) {
      delegationLib.followUp(dueToday)
    }
  }

  return delegationLib
})()
