// const { default: axios } = require('axios');
const {cloudinary}=require('../cloudinary');
const Post=require('../models/Post')
var mongoose = require('mongoose');

module.exports.createPost=async(req,res)=>{

    console.log("create post backend",req.body,req.file)
    const post=req.body;
    const id=post.id;
    delete post.id;
 
    let date=new Date().toLocaleString();
    let time=Date.now();

    if(post.tags!=undefined) post.tags=post.tags.replace(/\s+/g, ' ').trim().split(" ");
    post.postdate=date;
    post.time=time;
    post.user=id;

    let filename=""
    let path=""
    let image=""

   
    if(post.tags==undefined) post.tags=[]
    const {mode}=post;
    let newtags=[mode]
    let tags=post.tags;

    newtags
    .forEach((tag)=>{
        if(!tags.includes(tag)) tags.push(tag)

    })

    tags=tags.map(tag=>tag.toLowerCase());
    post.tags=tags;



   


    if(req.file)
    {
        filename=req.file.filename;
        path=req.file.path;
        image={url:path,filename}
        post.image=image

    }

    try
    {
        const newPost=new Post(post);
        console.log("Before")
        const saved=await newPost.save();
        if(saved)
        {
            console.log("saved backend ",saved)
            return res.status(200).json({
                title:"Success"
              })
        }

    }
    catch(err)
    {
        console.log("Error ",err)
    }


    console.log(post);
}


module.exports.getPost=async(req,res)=>{


    const {id}=req.params;
    const post=await Post.find({_id:id}).populate('user',{'username':1})
    console.log("Get post backend",post)
     return res.status(200).json({
        title:"Success",
        post
      })

}



module.exports.editPost=async(req,res)=>{


    const {id}=req.params;
   
    
    const updatedPost=req.body;
    console.log("Body ",updatedPost,req.file);
    let post=await Post.find({_id:id})
    post=post[0]
    // console.log("Postt",post)
    
    let filename=""
    let path=""
    
    if(updatedPost.tags!=undefined)
    {
        updatedPost.tags=updatedPost.tags.replace(/\s+/g, ' ').trim().split(" ")
        
        
    }
    if(updatedPost.tags==undefined) updatedPost.tags=[]
    const {mode}=updatedPost;
    const newtags=[mode.toLowerCase()];
    let tags=updatedPost.tags;

    newtags
    .forEach((tag)=>{
        if(!tags.includes(tag))
        {
          tags.push(tag)
          if(tag=='oncampus' && tags.includes('offcampus')) tags.splice(tags.indexOf('offcampus'),1)
          if(tag=='offcampus' && tags.includes('oncampus')) tags.splice(tags.indexOf('oncampus'),1)
        }

    })
    tags=tags.map(tag=>tag.toLowerCase());
    updatedPost.tags=tags;

    console.log("Tags added",updatedPost,tags,newtags)
   

    if(!req.file)
    {
        console.log("Check for deletion",updatedPost.imagedeletion)
        if(updatedPost.imagedeletion)
        {
           
        
            try{

            
            if(post.image!=undefined && post.image.url!=undefined) await cloudinary.uploader.destroy(post.image.filename);
            }
            catch(err)
            {
                console.log("Cloduinary error 1",err)
            }
            updatedPost.image={};
           
        }
    }
    else if(req.file)
    {
        console.log("Delete Image",post.image)

       if(post.image!=undefined && post.image.url!=undefined) 
       {
        console.log("inside cloudinary")
        try{
            await cloudinary.uploader.destroy(post.image.filename);
        }
        catch(err)
        {
            console.log("cloudinary error",err)
        }
        console.log(" cloudinary")
       }
       const {filename,path}=req.file;
       const image={url:path,filename}
       updatedPost.image=image;

    }

    try
    {
       const edited= await Post.findByIdAndUpdate(id,updatedPost)
       if(edited) {
        return res.status(200).json({
            title:"Success"
          })
       }
    }
    catch(err)
    {
        console.log("Error ",err)

    }
    
  



}


module.exports.deletePost=async(req,res)=>{
   
    const {id}=req.params;
    console.log("Delete req backend")
    let post=await Post.find({_id:id});
    post=post[0]
    // console.log("post found",post)
    // console.log("Image check",post.image)
    if(post.image!=undefined && post.image.url!=undefined)
    {
        console.log("inside clooud check")
        await cloudinary.uploader.destroy(post.image.filename);
    }
    const response=await Post.findByIdAndDelete({_id:id});
    // console.log("Respons backends")
    if(response) { 
     return res.status(200).json({
        title:"Success",

      })
    }

}

module.exports.getAllPosts=async(req,res)=>{
    console.log("inside getallposts")
    const posts=await Post.find({}).populate('user',{'username':1});
    // console.log("All posts backend",posts)
    return res.status(200).json({
        title:"Success",
        posts
      })

}

module.exports.getTaggedPostsCount=async(req,res)=>{
    let {tag}=req.params;
     tag=tag.toLowerCase();
    console.log("get tagged post",tag);
    const posts=await Post.findByTag(tag).populate('user')
    if(posts)
    {
        return res.status(200).json({
        title:"Success",
        posts
      })
    }

}


module.exports.upvotePost=async(req,res)=>{
    let {userid,postid}=req.params;
    const post=await Post.findOne({_id:postid});
    // userid = mongoose.mongo.ObjectId(userid);


    if(post.upvotes!=undefined && post.upvotes.indexOf(userid)!=-1)
    {
        console.log("backend remove upvote")

        await Post.findByIdAndUpdate(postid,{$pull:{upvotes:userid}});

    }
    else
    {
        console.log("backend upvote")
        await Post.findByIdAndUpdate(postid,{$push:{upvotes:userid}});
        await Post.findByIdAndUpdate(postid,{$pull:{downvotes:userid}});

    }

}



module.exports.downvotePost=async(req,res)=>{
    const {userid,postid}=req.params;
    const post=await Post.findOne({_id:postid});
    if(post.downvotes!=undefined && post.downvotes.indexOf(userid)!=-1)
    {
        console.log("backend remove downvote")

        await Post.findByIdAndUpdate(postid,{$pull:{downvotes:userid}});

    }
    else
    {
        console.log("backend downpvote")
        await Post.findByIdAndUpdate(postid,{$push:{downvotes:userid}});
        await Post.findByIdAndUpdate(postid,{$pull:{upvotes:userid}});

    }

}

module.exports.getUserPosts=async(req,res)=>{
    const {id}=req.params;
    console.log("backend userposts post")
    const {page,limit}=req.query;
    let skip=(page-1)*limit;
    const count=await Post.find({user:id}).count();
    const pages=Math.ceil(count/limit);
    const posts=await Post.find({user:id}).populate('user').skip(skip).limit(limit);
    if(posts)
    {

        console.log("user posts checking",posts)
    }
    return res.status(200).json({
        title:"Success",
        posts,
        pages
      })
}


module.exports.getPostPages=async(req,res)=>{

    console.log("backedn getpost")
    const {tag}=req.params;
    const {page,limit}=req.query;
    //limit is page size
    console.log("Params",tag,page,limit)
    let skip=(page-1)*limit;


    const count=await Post.findByTag(tag).count();
    const posts=await Post.findByTag(tag).populate('user').skip(skip).limit(limit);
    const pages=Math.ceil(count/limit);
    // console.log("backend posts",posts)
    return res.status(200).json({
        title:"Success",
        pages,
        posts
      })




    // console.log(("getPostpages backend",tag,req.params,req.query))

    
}