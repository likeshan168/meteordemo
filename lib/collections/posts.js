import { check } from 'meteor/check'
MONGO_URL = "mongodb://47.88.149.87/meteor";
Posts = new Mongo.Collection('posts');

//Meteor方法会绕过此方法，为此，再定义这个就没有什么意义
// Posts.allow({
//     insert: function (userId, doc) {
//         return !!userId;
//     }
// })
Posts.allow({
    update: function (userId, post) { return ownsDocument(userId, post); },
    remove: function (userId, post) { return ownsDocument(userId, post); }
})

Posts.deny({
    update: function (userId, post, fieldName) {
        // console.log(fieldName.count());
        return (_.without(fieldName, 'url', 'title').length > 0);
    }
});

Posts.deny({
    update: function (userId, post, fieldNames, modifier) {
        var errors = ValidatePost(modifier.$set);
        return errors.title || errors.url;
    }
})

//Insert 方法只会在服务端执行
Meteor.methods({
    postInsert: function (postAttributes) {
        check(Meteor.userId(), String);
        check(postAttributes, {
            title: String,
            url: String
        });

        // if(Meteor.isServer){
        //     postAttributes.title+="(server)";
        //     Meteor._sleepForMs(5000);
        // }else{
        //     postAttributes.title+="(client)";
        // }

        var errors = ValidatePost(postAttributes);
        if (errors.title || errors.url) {
            throw new Meteor.Error('invalid-post', '您必须啊为你的帖子填写标题和URL');
        }
        var postWithSameLink = Posts.findOne({
            url: postAttributes.url
        });
        if (postWithSameLink) {
            return {
                postExists: true,
                _id: postWithSameLink._id
            }
        }

        var user = Meteor.user();
        var post = _.extend(postAttributes, {
            userId: user._id,
            author: user.username,
            submitted: new Date(),
            upvoters: [],
            votes: 0
        });
        var postId = Posts.insert(post);
        return {
            _id: postId
        }
    },
    //投票事件
    upvote: function (postId) {
        check(this.userId, String);
        check(postId, String);
        var affected = Posts.update({
            _id: postId,
            upvoters: { $ne: this.userId }
        }, {
                $addToSet: { upvoters: this.userId },
                $inc: { votes: 1 }
            });
        if (!affected)
            throw new Meteor.Error('invalid', "You weren't able to upvote that post");
    }
});

ValidatePost = function (post) {
    var errors = {};
    if (!post.title) {
        errors.title = "请填写标题";
    }
    if (!post.url) {
        errors.url = "请填写URL";
    }

    return errors;
}


