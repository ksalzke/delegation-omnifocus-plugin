/* global PlugIn Form Task settings */
(() => {
  const action = new PlugIn.Action(function (selection, sender) {
    const config = this.delegationConfig

    // configuration
    const waitingTag = config.waitingTag()
    const uninheritedTags = config.uninheritedTags()
    const showForm = config.showForm()
    const defaultDeferDays = config.defaultDeferDays()
    const replacements = config.replacements()

    const functionLibrary = PlugIn.find('com.KaitlinSalzke.functionLibrary').library(
      'functionLibrary'
    )

    const tasks = selection.tasks

    asyncForEach(tasks, async (task) => {
      // do functions set up in config file first
      config.functionsForOriginalTaskBeforeWaiting().forEach((func) => {
        func(task)
      })

      // set up defaults for new 'waiting' task
      // -- task name
      let waitingForTaskName = task.name
      for (const replacement of replacements) {
        const namePattern = replacement[0]
        const replacementText = replacement[1]
        waitingForTaskName = waitingForTaskName.replace(
          namePattern,
          replacementText
        )
      }

      if (waitingForTaskName === task.name) {
        waitingForTaskName = `Waiting for: ${task.name}`
      }

      // -- defer date
      let deferDate = null
      if (defaultDeferDays !== null) {
        const defaultStartTime = settings.objectForKey('DefaultStartTime')
        const defaultStartTimeSplit = defaultStartTime.split(':')
        const defaultStartHours = defaultStartTimeSplit[0]
        const defaultStartMinutes = defaultStartTimeSplit[1]

        deferDate = functionLibrary.adjustDateByDays(
          new Date(),
          defaultDeferDays
        )
        deferDate.setHours(defaultStartHours)
        deferDate.setMinutes(defaultStartMinutes)
      }

      // -- due date
      let dueDate = null

      // if showForm is set to true in config, show form to edit task
      if (showForm === true) {
        const inputForm = new Form()
        const nameField = new Form.Field.String(
          'taskName',
          'Task name',
          waitingForTaskName
        )
        inputForm.addField(nameField)
        const deferField = new Form.Field.Date('deferDate', 'Defer date', deferDate)
        inputForm.addField(deferField)
        const dueField = new Form.Field.Date('dueDate', 'Due date', null)
        inputForm.addField(dueField)
        const formPrompt = 'Adjust task details if needed'
        const buttonTitle = 'Continue'
        const formPromise = inputForm.show(formPrompt, buttonTitle)
        inputForm.validate = (formObject) => {
          return true
        }
        await formPromise.then((formObject) => {
          waitingForTaskName = formObject.values.taskName
          deferDate = formObject.values.deferDate
          dueDate = formObject.values.dueDate
        })
      }

      // create task and add relevant tags
      const waitingTask = new Task(waitingForTaskName, task.after)
      waitingTask.addTag(waitingTag)
      waitingTask.removeTags(uninheritedTags)
      waitingTask.deferDate = deferDate
      waitingTask.dueDate = dueDate
    })
  })

  action.validate = function (selection, sender) {
    return selection.tasks.length >= 1
  }

  return action
})()

async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
