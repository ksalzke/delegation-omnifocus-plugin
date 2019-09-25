/*{
	"type": "action",
	"targets": ["omnifocus"],
	"author": "Kaitlin Salzke",
	"identifier": "com.KaitlinSalzke.followUp",
	"version": "1.0",
	"description": "Adds a new task to ‘follow up’ a selected waiting task (inserting it before the selected task)",
	"label": "Follow Up",
	"shortLabel": "Follow Up"
}*/
var _ = (function() {
	var action = new PlugIn.Action(function(selection, sender) {
		config = this.delegationConfig;

		// configure tags
		followUpTag = config.followUpTag();
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

		// PROCESSING USING THE DATA EXTRACTED FROM THE FORM
		formPromise.then(function(formObject) {
			selectedFollowUpMethod = formObject.values["contactMethod"];

			var task = selection.tasks[0];

			followUpTaskName = `Follow up: ${task.name.replace("Waiting for: ", "")}`;

			var followUpTask = new Task(followUpTaskName, task.before);
			followUpTask.addTags(task.tags);
			followUpTask.removeTag(waitingTag);
			followUpTask.addTag(selectedFollowUpMethod);
			followUpTask.note =
				"[FOLLOWUPON: omnifocus:///task/" + task.id.primaryKey + "]";
		});

		// PROMISE FUNCTION CALLED UPON FORM CANCELLATION
		formPromise.catch(function(err) {
			console.log("form cancelled", err.message);
		});
	});

	action.validate = function(selection, sender) {
		// validation code
		// selection options: tasks, projects, folders, tags
		return selection.tasks.length === 1;
	};

	return action;
})();
_;
