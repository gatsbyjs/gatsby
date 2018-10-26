 (17 sloc)  727 Bytes
# Number of days of inactivity before an issue becomes stale
daysUntilStale: 180
# Number of days of inactivity before a stale issue is closed
daysUntilClose: 15
# Issues with these labels will never be considered stale
exemptLabels:
  - bug
# Label to use when marking an issue as stale
staleLabel: stale?
# Comment to post when marking an issue as stale. Set to `false` to disable
markComment: >
  This issue has been automatically marked as stale because it has not had
  recent activity. It will be closed if no further activity occurs. Thank you
  for your contributions.
# Comment to post when closing a stale issue. Set to `false` to disable
closeComment: >



# Coding it

We would set the OnSelect property for the "action" buttons to update a context variable:
```
EnableButton.OnSelect: UpdateContext({ enabled: true })
DisableButton.OnSelect: UpdateContext({ enabled: false })
HideButton.OnSelect: UpdateContext({ visible: false })
ShowButton.OnSelect: UpdateContext({ visible: true })
And in the button that you want to show / hide / disable / enable, you would bind the Disabled and Visible properties to those context variables:

MyButton.Disabled: !enabled
MyButton.Visible: visible
```
