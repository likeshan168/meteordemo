Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function () {
        //路由级别的订阅 这意味着当路由器初始化时，加载所有数据。
        // return [Meteor.subscribe('posts'), Meteor.subscribe('comments')];
        // return [Meteor.subscribe('posts'), Meteor.subscribe('notifications')];
        return [Meteor.subscribe('notifications')];
    }
})



Router.route('/posts/:_id', {
    name: 'postPage',
    data: function () {
        return Posts.findOne(this.params._id);
    },

    waitOn: function () {
        return [
            Meteor.subscribe('comments', this.params._id),
            Meteor.subscribe('singlePost', this.params._id)
        ];
    }
});

Router.route('/posts/:_id/edit', {
    name: 'postEdit',
    data: function () {
        return Posts.findOne(this.params._id);
    },
    waitOn: function () {
        return [
            //路由path级别的订阅
            Meteor.subscribe('singlePost', this.params._id)
        ];
    }
})


Router.route('/submit', { name: 'postSubmit' });


PostsListController = RouteController.extend({
    template: 'postsList',
    increment: 5,
    postsLimit: function () {
        return parseInt(this.params.postsLimit) || this.increment;
    },
    findOptions: function () {
        return { sort: this.sort, limit: this.postsLimit() };
    },
    // waitOn: function () {
    //     return Meteor.subscribe('posts', this.findOptions());
    // },
    subscriptions: function () {
        this.postsSub = Meteor.subscribe('posts', this.findOptions());
    },
    posts: function () {
        return Posts.find({}, this.findOptions());
    },
    data: function () {
        var hasMore = this.posts().count() === this.postsLimit();
        // var nextPath = this.route.path({ postsLimit: this.postsLimit() + this.increment });
        return {
            posts: this.posts(),
            ready: this.postsSub.ready,
            nextPath: hasMore ? this.nextPath() : null
        };
    }
});

NewPostsController = PostsListController.extend({
    sort: { submitted: -1, _id: -1 },
    nextPath: function () {
        return Router.routes.newPosts.path({ postsLimit: this.postsLimit() + this.increment })
    }
});

BestPostsController = PostsListController.extend({
    sort: { votes: -1, submitted: -1, _id: -1 },
    nextPath: function () {
        return Router.routes.bestPosts.path({ postsLimit: this.postsLimit() + this.increment })
    }
});

//放到路由组的最，后因为它太泛泛了可以匹配所有路径
// Router.route('/:postsLimit?', {
//     name: 'postsList'
// });

Router.route('/', {
    name: 'home',
    controller: NewPostsController
});
Router.route('/new/:postsLimit?', { name: 'newPosts' });
Router.route('/best/:postsLimit?', { name: 'bestPosts' });


var requireLogin = function () {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        this.next();
    }
}

Router.onBeforeAction('dataNotFound', { only: 'postPage' });

Router.onBeforeAction(requireLogin, { only: 'postSubmit' });