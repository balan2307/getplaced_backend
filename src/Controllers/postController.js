// const { default: axios } = require('axios');
const {cloudinary}=require('../cloudinary');
const Post=require('../models/Post')
var mongoose = require('mongoose');

module.exports.createPost=async(req,res)=>{

   
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
    
        const saved=await newPost.save();
        if(saved)
        {
          
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


module.exports.getPost=async(req,res)=>{


    const {id}=req.params;
    const post=await Post.find({_id:id}).populate('user',{'username':1})
  
     return res.status(200).json({
        title:"Success",
        post
      })

}



module.exports.editPost=async(req,res)=>{


    const {id}=req.params;
   
    
    const updatedPost=req.body;

    let post=await Post.find({_id:id})
    post=post[0]

    
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


   

    if(!req.file)
    {
       
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
     

       if(post.image!=undefined && post.image.url!=undefined) 
       {

        try{
            await cloudinary.uploader.destroy(post.image.filename);
        }
        catch(err)
        {
            console.log("cloudinary error",err)
        }

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
    let post=await Post.find({_id:id});
    post=post[0]
    if(post.image!=undefined && post.image.url!=undefined)
    {
        await cloudinary.uploader.destroy(post.image.filename);
    }
    const response=await Post.findByIdAndDelete({_id:id});
    if(response) { 
     return res.status(200).json({
        title:"Success",

      })
    }

}

module.exports.getAllPosts=async(req,res)=>{

    const posts=await Post.find({}).populate('user',{'username':1});
    return res.status(200).json({
        title:"Success",
        posts
      })

}

module.exports.getTaggedPostsCount=async(req,res)=>{
    let {tag}=req.params;
     tag=tag.toLowerCase();
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


    if(post.upvotes!=undefined && post.upvotes.indexOf(userid)!=-1)
    {
      

        await Post.findByIdAndUpdate(postid,{$pull:{upvotes:userid}});

    }
    else
    {
  
        await Post.findByIdAndUpdate(postid,{$push:{upvotes:userid}});
        await Post.findByIdAndUpdate(postid,{$pull:{downvotes:userid}});

    }

}



module.exports.downvotePost=async(req,res)=>{
    const {userid,postid}=req.params;
    const post=await Post.findOne({_id:postid});
    if(post.downvotes!=undefined && post.downvotes.indexOf(userid)!=-1)
    {
      

        await Post.findByIdAndUpdate(postid,{$pull:{downvotes:userid}});

    }
    else
    {
 
        await Post.findByIdAndUpdate(postid,{$push:{downvotes:userid}});
        await Post.findByIdAndUpdate(postid,{$pull:{upvotes:userid}});

    }

}

module.exports.getUserPosts=async(req,res)=>{
    const {id}=req.params;
    const {page,limit}=req.query;
    let skip=(page-1)*limit;
    const count=await Post.find({user:id}).count();
    const pages=Math.ceil(count/limit);
    const posts=await Post.find({user:id}).populate('user').skip(skip).limit(limit);
    return res.status(200).json({
        title:"Success",
        posts,
        pages
      })
}


module.exports.getPostPages=async(req,res)=>{


    const {tag}=req.params;
    const {page,limit}=req.query;
    let skip=(page-1)*limit;


    const count=await Post.findByTag(tag).count();
    const posts=await Post.findByTag(tag).populate('user').skip(skip).limit(limit);
    const pages=Math.ceil(count/limit);

    return res.status(200).json({
        title:"Success",
        pages,
        posts
      })


    
}


module.exports.searchPost=async(req,res)=>{


    const {page,limit,search}=req.query;
    let skip=(page-1)*limit;

    const count=await Post.countDocuments({ 
        $or: [
            { company: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } }
        ] 
    }).collation({ locale: 'en', strength: 1 })
    const pages=Math.ceil(count/limit);



    const posts=await Post.find({ 
        $or: [
            { company: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } }
        ] 
    }).collation({ locale: 'en', strength: 1 }).populate('user').skip(skip).limit(limit);;


    return res.status(200).json({
        title:"Success",
        pages,
        posts
      })






    
}