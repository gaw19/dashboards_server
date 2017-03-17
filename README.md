
* 增加了基于mongoose的登录管理， 密码还是明文，加密方式还确定。
* 加了权限组，限制用户可以见到的文件。
* 文件别名。 由于原系统不支持中文，故加别名功能。

使用方式，

user表关联到group表。
group表的filter_regex， 正则表达式列表， 如果有一条匹配，则通过。

mongoose的Schema如下：

    const userSchema = new mongoose.Schema({
        name: { type: String, unique: true },
        password: String,
        group : { type: Schema.Types.ObjectId, ref: 'dashboard_group' }
    }, { timestamps: true });
    
    const groupSchema = new mongoose.Schema({
        name: { type: String, unique: true },
        filter_regex: [String],
    }, { timestamps: true });
    
    const fileAliasSchema = new mongoose.Schema({
        name: { type: String, unique: true },
        alias: String,
    }, { timestamps: true });