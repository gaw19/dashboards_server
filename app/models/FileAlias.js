const mongoose = require('mongoose'), Schema = mongoose.Schema;

const fileAliasSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    alias: String,
}, { timestamps: true });

const FileAlias = mongoose.model('dashboard_file_alias', fileAliasSchema);

module.exports = FileAlias;
