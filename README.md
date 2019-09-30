# About

This is an Omni Automation plug-in bundle for OmniFocus that provides 'waiting for' and 'follow up' actions. Further details of these actions are provided below.

# Installation & Set-Up

1. Click on the green `Clone or download` button above to download a `.zip` file of all the files in this GitHub repository.
2. Unzip the downloaded file.
3. Open the configuration file located at `Resources/delegationConfig.js` and make any changes needed to reflect your OmniFocus set-up. Further explanations of the options are included within that file as comments.
4. Rename the entire folder to anything you like, with the extension `.omnifocusjs`
5. Move the resulting file to your OmniFocus plug-in library folder.

# Actions

This plug-in contains the following two actions:

## Waiting For
This action can be run on one or more selected tasks and creates a new task after the selected task(s) whose:
* name is the same as the original task's name, but with `Waiting for: ` prepended
* tag is the `waitingTag` specified in the configuration file (currently this is `Activity Type: ⏳ Waiting` by default).

Note that any project tags will also be inherited.

## Follow Up
This action can be run on one or more selected tasks.

It first prompts the user for a contact method to be used to follow up on the selected task(s). These are taken from the `followUpMethods` variable in the configuration file and by default are any children of the `Activity Type: Contact` tag.

Then, for each selected task:
1. If the task is not already contained within such an action group, creates a sequential action group with the same name as the selected task(s).
2. Moves the task into the parent sequential action group.
3. Creates a new task before the original task (and inside the action group) whose: 
* name is the same as the original task's name, but with  `Follow up: ` prepended in place of `Waiting for: `.
* tags are the same as the original task's tags, but with the selected follow-up method added and any waiting tags (the tag specified as `waitingTag` in the configuration file as well as any of its children) removed
* note is a link to the original task in the format `[FOLLOWUPON: omnifocus///task/taskid]`

Note that the parent sequential action group is created so that the 'waiting for' task only becomes available after the follow-up task has been completed (or dropped or deleted), even in a parallel project or single-action list.