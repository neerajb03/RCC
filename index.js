var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://localhost:27017/RCC', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

// Schema for the user model
var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// Create a User model based on the schema
var User = mongoose.model('User', userSchema);


//admin Routes
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.send(users);
  });
  
  app.delete('/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: 'User deleted' });
  });

// Route for user signup
app.post("/sign_up", (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var newUser = new User({
        name: name,
        email: email,
        password: password
    });

    newUser.save()
        .then(user => {
            console.log("User Registered Successfully");
            return res.redirect('home.html');
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send("Error saving user");
        });
});

// Route for user login
app.post("/login", async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    try {
        const user = await User.findOne({ email: email, password: password });
        
        if (!user) {
            return res.status(404).send("User not found");
        }

        

        if (user.email === 'admin@gmail.com') {
            console.log("Admin Logged in Successfully");
            // Set session cookies or JWT tokens for authentication here
            return res.redirect('users.html');
        } else {
            console.log("User Logged in Successfully");
            // Set session cookies or JWT tokens for authentication here
            return res.redirect('home.html');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Error finding user");
    }
});


// Schema for the feedback model
var feedbackSchema = new mongoose.Schema({
    topic: String,
    semester: String,
    message: String
});

// Create a Feedback model based on the schema
var Feedback = mongoose.model('Feedback', feedbackSchema);

// Route for submitting feedback
app.post("/submit_feedback", (req, res) => {
    var topic = req.body.topic;
    var semester = req.body.semester;
    var message = req.body.message;

    var newFeedback = new Feedback({
        topic: topic,
        semester: semester,
        message: message
    });

    newFeedback.save()
        .then(feedback => {
            console.log("Feedback Submitted Successfully");
            return res.redirect('feedback.html'); // Redirect to feedback page or any other page
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send("Error submitting feedback");
        });
});

// Assuming you have a route in your Express.js server to fetch feedback data
app.get("/get_feedback", async (req, res) => {
    try {
        const feedbackData = await Feedback.find({}).lean(); // Use lean() to get plain JavaScript objects

        res.json(feedbackData); // Send feedback data as JSON response
    } catch (err) {
        console.error("Error fetching feedback data:", err);
        res.status(500).json({ error: "Error fetching feedback data" });
    }
});



// Get all feedbacks
app.get('/get_feedback', async (req, res) => {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
});

// DELETE route for deleting feedback
app.delete('/delete_feedback/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(id);
        if (deletedFeedback) {
            res.json({ message: 'Feedback deleted successfully' });
        } else {
            res.status(404).json({ message: 'Feedback not found' });
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Define schema for contact form data
const contactSchema = new mongoose.Schema({
    email: { type: [String], required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }
});

// Create Contact model based on the schema
const Contact = mongoose.model("Contact", contactSchema);

// Route for submitting contact form
app.post("/submit_contact", (req, res) => {
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.textarea;

    // Create a new instance of Contact model with form data
    const newContact = new Contact({
        email: email,
        subject: subject,
        message: message
    });

    // Save the newContact instance to MongoDB
    newContact.save()
        .then(() => {
            console.log("Contact form submitted successfully");
            return res.redirect('contact.html');
        })

        .catch((err) => {
            console.error("Error saving contact form data:", err);
            res.status(500).json({ error: "Error submitting contact form" });
        });
});

const ReviewSchema = new mongoose.Schema({
    restaurant: String,
    rating: Number,
    review: String,
  });
  
  const Review = mongoose.model('Review', ReviewSchema);
  
 
  
  // Route to submit a review
  app.post('/api/reviews', async (req, res) => {
    try {
      const { restaurant, rating, review } = req.body;
      const newReview = new Review({ restaurant, rating, review });
      await newReview.save();
      res.status(201).json({ message: 'Review submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
 // Route to get reviews for a specific restaurant
app.get('/api/reviews', async (req, res) => {
    try {
      const selectedRestaurant = req.query.restaurant;
      const reviews = await Review.find({ restaurant: selectedRestaurant });
      res.status(200).json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // GET all reviews
app.get('/reviewss', async (req, res) => {
    const reviews= await Review.find();
    res.json(reviews);
});

app.delete('/reviews/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const reviewIndex = reviews.findIndex(review => review.id === id);
    
    if (reviewIndex !== -1) {
        reviews.splice(reviewIndex, 1);
        res.status(200).send('Review deleted successfully.');
    } else {
        res.status(404).send('Review not found.');
    }
});
  



// // Create schema for replies
// const replySchema = new mongoose.Schema({
//     postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
//     replyContent: String,
//     date: { type: Date, default: Date.now },
//   });

//   const Reply = mongoose.model('Reply', replySchema);

// // Define the reply schema as a subdocument of Post
// const postSchema = new mongoose.Schema({
//     flair: String,
//     title: String,
//     postContent: String,
//     date: { type: Date, default: Date.now },
//     replies: [{
//         replyContent: String,
//         date: { type: Date, default: Date.now }
//     }]
// });

// const Post = mongoose.model('Post', postSchema);

// app.use(express.json());

// // Route to for queries
// app.post('/api/posts', async (req, res) => {
//     try {
//       const { flair, title, postContent } = req.body;
//       const newPost = await Post.create({ flair, title, postContent, date: new Date() });
//       res.status(201).json(newPost);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });


// //route for replies
// app.post('/api/replies', async (req, res) => {
//     try {
//         const { postId, replyContent } = req.body;

//         if (!postId || !replyContent) {
//             return res.status(400).json({ message: 'Invalid request data' });
//         }
//         if (!ObjectId.isValid(postId)) {
//             return res.status(400).json({ message: 'Invalid postId format' });
//         }
//         // Find the post by postId
//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         // Add the new reply to the post's replies array
//         post.replies.push({ replyContent });

//         // Save the updated post with the new reply
//         await post.save();

//         // Respond with a success message
//         res.status(201).json({ message: 'Reply added successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  });
  
  const Property = mongoose.model('Property', propertySchema);

// Middleware to parse JSON
app.use(express.json());

// Define routes
app.post('/api/properties', async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('home.html');
});

app.listen(5500, () => {
    console.log("Listening on PORT 5500");
});
