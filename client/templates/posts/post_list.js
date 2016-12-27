// var postsData = [
//     {
//         title: 'Introducing Telescope',
//         url: 'http://sachagreif.com/Introducing-telescope/'
//     },
//     {
//         title: 'Meteor',
//         url: 'http://meteor.com/'
//     },
//     {
//         title: 'The Meteor Book',
//         url: 'http://themeteorbook.com/'
//     }
// ];
//因为我们在 route 级设置数据 context，所以不需要helper方法
// Template.postsList.helpers({
//     posts: function () {
//         return Posts.find({}, { sort: { submitted: -1 } });
//     }
// });