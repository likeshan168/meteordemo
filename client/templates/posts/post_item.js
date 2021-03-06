Template.postItem.helpers({
    domain: function () {
        var a = document.createElement(a);
        // console.log(this.url);
        a.href = this.url;
        // console.log(a);
        // return a.hostname;
        return this.url;
    },
    ownPost: function () {
        return this.userId == Meteor.userId();
    },
    upvotedClass: function () {
        var userId = Meteor.userId();
        if (userId && !_.include(this.upvoters, userId)) {
            return 'btn-primary upvotable';
        } else {
            return 'disabled';
        }
    }
    // commentCount: function () {
    //     return Comments.find({ postId: this._id }).count();
    // }
})

Template.postItem.events({
    'click .upvotable': function (e) {
        e.preventDefault();
        Meteor.call('upvote', this._id);
    }
});