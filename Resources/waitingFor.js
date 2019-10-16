var _ = (function() {
  var action = new PlugIn.Action(function(selection, sender) {
    config = this.delegationConfig;

    // configuration
    waitingTag = config.waitingTag();
    uninheritedTags = config.uninheritedTags();
    showForm = config.showForm();

    tasks = selection.tasks;

    asyncForEach(tasks, async task => {
      // do functions set up in config file first
      config.functionsForOriginalTaskBeforeWaiting().forEach(func => {
        func(task);
      });

      // add "Waiting for: " to task name
      waitingForTaskName = `Waiting for: ${task.name}`;

      // if showForm is set to true in config, show form to edit task
      if (showForm === true) {
        var inputForm = new Form();
        nameField = new Form.Field.String(
          "taskName",
          "Task name",
          waitingForTaskName
        );
        inputForm.addField(nameField);
        let formPrompt = "Adjust task details if needed";
        let buttonTitle = "Continue";
        formPromise = inputForm.show(formPrompt, buttonTitle);
        inputForm.validate = formObject => {
          return true;
        };
        await formPromise.then(formObject => {
          waitingForTaskName = formObject.values["taskName"];
        });
      }

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

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
