(() => {
  var action = new PlugIn.Action(function (selection, sender) {
    functionLibrary = this.delegationLib;
    functionLibrary.followUp(selection.tasks);
  });

  action.validate = function (selection, sender) {
    return selection.tasks.length >= 1;
  };

  return action;
})();
