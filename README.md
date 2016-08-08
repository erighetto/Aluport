# Drupal 8 Theme

The files contained in this repo provide a starting point for developing a Drupal 8 theme. It is a subtheme of Classy.

Consider this a work in progress. There is much that needs to be added and finished. (See the [TODO list here](https://github.com/startinggravity/Drupal-8-Theme/blob/master/TODO.md).)

There are many concepts at play here to allow you to create a custom theme using tools for performance, accessibility, testing, and fast development.

This repo includes:
* [Gulp](http://gulpjs.com) for task-running
* [Sass](http://sass-lang.com) for pre-processing CSS, using Libsass so we don't get bogged down with Ruby
* [Browser Sync](http://www.browsersync.io) for simultaneous testing on multiple browsers
* [Image Optimization](https://www.npmjs.com/package/gulp-image-optimization) for minifying PNG, JPEG, GIF and SVG images on the fly
* [Bourbon](http://bourbon.io) Sass mixin library
* [Neat](http://neat.bourbon.io) for semantic grids that are designed to work with Bourbon
* And much more theme development goodness


## Installation Instructions

We are assuming here you have already installed Drupal 8 and it is running on your development server. To begin installing this theme, navigate to the themes directory (`cd themes`). If you wish, you can add a new directory for your custom themes (`mkdir custom && cd custom`).

Change directories to where your put your theme.

```bash
cd aluport
```

Edit line 1 of `gulpfile.js`, replacing `your-site.tld` with the domain of your local site.

Now install all of the Node.js modules we need. (This will take a while.)

```bash
npm install
```


You're now ready to visit your Drupal site and enable the new theme.

## Post-installation Notes

Running `npm install`  will add several files in directories called node_modules. The .gitignore file in your theme will prevent these files from being added to your repo. This is intentional because the files are only needed for development.

If you are adding developers on a team who are editing the theme, after they have cloned your site's repo they will need to navigate to the theme directory and run these commands:

```bash
npm install
```
or
```bash
gulp build-dev
```


## For development

The development of a theme using these files and configuation would normally proceed as follows:

1. **Edit Sass files to provide layout and styling.** As noted before Sass files are written once and used in Pattern Lab to largely eliminate redundant coding. The Sass files reside in your theme directory tree.

1. **Use Gulp commands to automate the development process.** Before you beging writing files, use the command `gulp build-dev` to start up the full task-running process. Gulp will watch for file changes, process Sass files into CSS, trigger Drush to clear cache when Drupal template files are changed, and refresh the browser.

1. **Gulp will watch for changes in your files.** Not only will your Sass files automatically process into CSS, but any changes to your Pattern Lab patterns and Drupal theme template files will trigger appropriate changes as well. This includes reloading Browser Sync on each change so that the changes appear right away in your browser.

1. **Use `control-c` to stop Gulp watch tasks.** When you use the command `gulp build-dev` to start development, watch tasks will continue to run and Browser Sync will refresh your browser with each change. When you wish to stop these processes, use the keyboard command `control-c` (assuming you are developing on a Mac). This will stop all tasks and the site will no longer be accessisble from http://localhost:3000.

1. **Put theme images in `/img-src`.** When you add image files in the `/img-src directory`, Gulp will automatically recognize those files, processing them for optimization, and move a copy to the `/images` directory. You should use `/images` in the path of your images when referencing them in SCSS.

1. **Put theme template files in `/templates`.** This directory already contains several template files, lifted directly from Classy theme. Use these or add new ones within this file structure.

1. **Extra time is needed before the browser refreshes when you change template files.** When you make changes to Drupal template files or add new files, a Gulp task will clear Drupal cache and refresh the browser. Drupal requires that cached is cleared after template change, so a Drush command is added to the the watch sequence for template files. This step takes longer to run than other changes, so expect to wait at least 15 seconds before your changes are reflected in the browser. (See [this issue](https://github.com/startinggravity/Drupal-8-Theme/issues/1) for more details.)
