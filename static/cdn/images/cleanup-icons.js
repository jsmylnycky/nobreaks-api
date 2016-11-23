'use strict';

let fs = require('fs');

let iconsDir = __dirname + '/icons/';

fs.readdir(iconsDir, (err, files) => {
	if (err) {
		console.log('ERROR:', err);
	}

  files.forEach((file) => {
    if (!file) return;

    let fileParts = file.split('.');
    let ext = (fileParts[1] || '').toLowerCase();

    if (ext === 'png') {
      console.log(`${iconsDir}${file} -> ${iconsDir}${fileParts[0]}`.toLowerCase() + '.png');
      fs.renameSync(`${iconsDir}${file}`, `${iconsDir}${fileParts[0]}`.toLowerCase() + '.png');
    } else if (ext === 'blp') {
      fs.unlinkSync(`${iconsDir}${file}`);
    }
  });

  console.log('done');
});
