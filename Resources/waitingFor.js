var _ = (function() {
	var action = new PlugIn.Action(function(selection, sender) {
		config = this.delegationConfig;

		// configure tags
		waitingTag = config.waitingTag();

		tasks = selection.tasks;

		tasks.forEach(task => {
			// add "Waiting for: " to task name
			waitingForTaskName = `Waiting for: ${task.name}`;

			// create task and add relevant tags
			waitingTask = new Task(waitingForTaskName, task.after);
			waitingTask.addTag(waitingTag);
		});
	});

	action.validate = function(selection, sender) {
		return selection.tasks.length >= 1;
	};

	return action;
})();
_;
