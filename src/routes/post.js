const express = require("express");
const router = express.Router();
const PostController=require('../Controllers/postController')
const {storage}=require('../cloudinary/index')
const multer  = require('multer');
const Post = require("../models/Post");
const upload = multer({ storage })

router.route('/user/post')
.post(upload.single('image'),PostController.createPost)

router.route('/user/post/:id')
.get(PostController.getPost)
.post(upload.single('image'),PostController.editPost)
.delete(PostController.deletePost)


router.route('/user/posts')
.get(PostController.getAllPosts)

router.route('/posts/:tag')
.get(PostController.getTaggedPostsCount)

router.route('/posts/pages/:tag')
.get(PostController.getPostPages)

router.route('/user/:userid/post/:postid/upvote')
.patch(PostController.upvotePost)


router.route('/user/:userid/post/:postid/downvote')
.patch(PostController.downvotePost)

router.route('/user/posts/:id')
.get(PostController.getUserPosts)



module.exports=router;

