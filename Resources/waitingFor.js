var _ = (function() {
  var action = new PlugIn.Action(function(selection, sender) {
    config = this.delegationConfig;

    // configure tags
    waitingTag = config.waitingTag();
    uninheritedTags = config.uninheritedTags();

    tasks = selection.tasks;

    tasks.forEach(task => {
      // do functions set up in config file first
      config.functionsForOriginalTaskBeforeWaiting().forEach(func => {
        func(task);
      });

      // add "Waiting for: " to task name
      waitingForTaskName = `Waiting for: ${task.name}`;

      // create task and add relevant tags
      waitingTask = new Task(waitingForTaskName, task.after);
      waitingTask.addTag(waitingTag);
      waitingTask.removeTags(uninheritedTags);
    });
  });

  action.validate = function(selection, sender) {
    return selection.tasks.length >= 1;
  };

  return action;
})();
_;
