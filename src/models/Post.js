const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const postSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    image:{
        url:String,
        filename:String
       
    },
    content:{
        type:String,
        required:true
          
    },
    company:{
        type:String,
        required:true
    },
    college:{
        type:String
    },
    mode:{
      type: String,
      enum: ["onCampus","offCampus"]
    },
    difficulty:{
        type: String,
        enum: ["Easy","Medium","Hard"]

    },
    tags:
        [{
            type: String
        }]
    ,
    comments:[{
        type:Schema.Types.ObjectId,
        ref:'Comment'
    }],
    upvotes:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    downvotes:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    votes: {
        type: Number
      },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'

    },
    time:{
        type:Number
    },
    postdate:{
        type:String
    }
   
    
})



postSchema.index({ company: 1, content: 'text' }, { collation: { locale: 'en', strength: 1 } });

postSchema.pre('findOneAndUpdate', function(next) {
   

    // this.update({}, { $set: { title: 'demo' } });
    const upvotes=this.upvotes!=undefined  ? this.upvotes.length : 0
    const downvotes=this.downvotes!=undefined  ? this.downvotes.length : 0
    this.votes = upvotes-downvotes;
    next();
  });

postSchema.statics.findByTag=function(tag){

    return this.find({tags:{$in:[tag]}})
}


const Post=mongoose.model('Post',postSchema);

module.exports=Post;