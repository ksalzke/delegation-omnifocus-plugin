/* global PlugIn */
(() => {
  const action = new PlugIn.Action(function (selection, sender) {
    const functionLibrary = this.delegationLib
    functionLibrary.followUp(selection.tasks)
  })

  action.validate = function (selection, sender) {
    return selection.tasks.length >= 1
  }

  return action
})()
