/* global PlugIn Form flattenedTags */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const syncedPrefs = this.delegationLib.loadSyncedPrefs()

    // get current preferences or set defaults if they don't yet exist
    const waitingTag = (syncedPrefs.readString('waitingTagID') !== null) ? await this.delegationLib.getWaitingTag() : null

    // create and show form
    const form = new Form()
    form.addField(new Form.Field.Option('waitingTag', 'Waiting Tag', flattenedTags, flattenedTags.map(t => t.name), waitingTag, null))
    await form.show('Preferences: Dependency', 'OK')

    // save preferences
    syncedPrefs.write('waitingTagID', form.values.waitingTag.id.primaryKey)
  })

  action.validate = function (selection, sender) {
    // always available on Mac
    if (Device.current.mac) return true

    // otherwise only show when nothing is selected
    return selection.tasks.length === 0 && selection.projects.length === 0
  }

  return action
})()
