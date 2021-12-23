/* global PlugIn Form flattenedTags */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const syncedPrefs = this.delegationLib.loadSyncedPrefs()

    // get current preferences or set defaults if they don't yet exist
    const waitingTag = (syncedPrefs.readString('waitingTagID') !== null) ? await this.delegationLib.getWaitingTag() : null
    const contactTag = (syncedPrefs.readString('contactTagID') !== null) ? await this.delegationLib.getContactTag() : null
    const defaultContactTag = (syncedPrefs.readString('defaultContactTagID') !== null) ? await this.delegationLib.getDefaultContactTag() : null



    // create and show form
    const form = new Form()
    form.addField(new Form.Field.Option('waitingTag', 'Waiting Tag', flattenedTags, flattenedTags.map(t => t.name), waitingTag, null))
    const contactTagField = new Form.Field.Option('contactTag', 'Contact Method Tag', flattenedTags, flattenedTags.map(t => t.name), contactTag, 'None')
    contactTagField.allowsNull = true
    let selectedContactTag = contactTag
    form.addField(contactTagField)

    const generateDefaultContactTagField = () => {
      // if no contact tag selected or no children don't add 'default' field
      if (form.values.contactTag === null || form.values.contactTag === undefined) return true
      if (form.values.contactTag.flattenedChildren.length < 2) return true

      // add updated default contact method field
      const contactTags = form.values.contactTag.flattenedChildren
      form.addField(new Form.Field.Option('defaultContactTag', 'Default Contact Method', contactTags, contactTags.map(t => t.name), defaultContactTag, 'None'))
      selectedContactTag = form.values.contactTag
      return true
    }

    if (contactTag !== null) generateDefaultContactTagField(contactTag)

    form.validate = form => {
      // don't update if no change
      if (form.values.contactTag === selectedContactTag) return true

      // remove field if it already exists
      const defaultContactTagField = form.fields.find(field => field.key === 'defaultContactTag')
      if (defaultContactTagField !== undefined) form.removeField(defaultContactTagField)

      generateDefaultContactTagField()
      return true
    }

    await form.show('Preferences: Dependency', 'OK')

    // save preferences
    syncedPrefs.write('waitingTagID', form.values.waitingTag.id.primaryKey)
    syncedPrefs.write('contactTagID', form.values.contactTag.id.primaryKey)
    syncedPrefs.write('defaultContactTagID', form.values.defaultContactTag.id.primaryKey)

  })

  action.validate = function (selection, sender) {
    // always available on Mac
    if (Device.current.mac) return true

    // otherwise only show when nothing is selected
    return selection.tasks.length === 0 && selection.projects.length === 0
  }

  return action
})()
