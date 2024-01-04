# Getting Started with ShamPit Display

You can access the pit display [here](https://ccshambots.github.io/ShamPit-Display/).

## Set up

When you ggo to the app for the first time on a new computer, you'll be taken directly to the settings page to configure your information. This will be saved on the computer unless you actively delete it (not recommended)

### TBA API Key
You need to provide an API key for The Blue Alliance for the display to be able to access any information from the database. To get an API key, simply go to [TBA's account page](https://www.thebluealliance.com/account) and log in to or create your account. Scroll to the section labeled "Read API Keys," create a new API key, and copy it into the TBA API Key field in the settings window of the pit display.

![Image of Creating a TBA API Key](https://raw.githubusercontent.com/CCShambots/5907-pit-display/master/photos/tba%20api.png)


### Selecting an Event

You can select an event to display in multiple ways

1. Enter the Event Key directly - copy the event key from the end of a TBA event page (i.e. `https://www.thebluealliance.com/event/2023dal` becomes `2023dal`)
2. Copy the full event link into the Event Key Field
3. Select one of your team's events from the dropdown. If you use the dropdown, you don't have to enter anything into the Event Key Field if you select from here. It will autofill for you.

The Event Key field will turn green when it matches one of the events in the dropdown for you team. This will guarantee that you have a valid key.

### Using the CC Shambots Database
Members of the CC Shambots will take photos of teams at events and upload them to a database using the app ShamPic (available on Google Play and Apple App Store). Anyone either running their own instances of ShamScout or who are at the same event as the CC Shambots are welcome to assist with this endeavor. This database is used to display photos of teams on the pit display. The settings window has authorization fields that allow you to access the database. If you are not a member of the CC Shambots or don't care to log in, you can leave these fields blank and the display will still work with images teams have uploaded to The Blue Alliance.

# Contributing to ShamPit-Display
See [CONTRIBUTING.md](https://github.com/CCShambots/ShamPit-Display/blob/master/CONTRIBUTING.md)