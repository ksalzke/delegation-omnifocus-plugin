var _ = (function() {
	var action = new PlugIn.Action(function(selection, sender) {
		config = this.delegationConfig;

		// configure tags
		waitingTag = config.waitingTag();
		followUpMethods = config.followUpMethods();
		defaultFollowUpMethod = config.defaultFollowUpMethod();

		// show form to select follow up method
		var inputForm = new Form();

		popupMenu = new Form.Field.Option(
			"contactMethod",
			"Contact Method",
			followUpMethods,
			null,
			defaultFollowUpMethod
		);

		inputForm.addField(popupMenu);

		formPrompt = "Select contact method:";
		formPromise = inputForm.show(formPrompt, "Continue");

		inputForm.validate = function(formObject) {
			validation = true;
			return validation;
		};

		// process results from form selection
		formPromise.then(function(formObject) {
			selectedFollowUpMethod = formObject.values["contactMethod"];

			task = selection.tasks[0];

			// replace "Waiting for: " with "Follow up: " in task name
			followUpTaskName = `Follow up: ${task.name.replace("Waiting for: ", "")}`;

			// create task and add relevant tags and link to original task
			followUpTask = new Task(followUpTaskName, task.before);
			followUpTask.addTag(selectedFollowUpMethod);
			followUpTask.addTags(task.tags);
			followUpTask.removeTag(waitingTag);
			followUpTask.note =
				"[FOLLOWUPON: omnifocus:///task/" + task.id.primaryKey + "]";
		});

		// log error if form is cancelled
		formPromise.catch(function(err) {
			console.log("form cancelled", err.message);
		});
	});

	action.validate = function(selection, sender) {
		return selection.tasks.length === 1;
	};

	return action;
})();
_;
