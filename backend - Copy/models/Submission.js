import mongoose from "mongoose";

// Define the blueprint (Schema) for your Contact Form entries
const submissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address"
      ]
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject line"],
      trim: true,
      maxlength: [150, "Subject cannot exceed 150 characters"]
    },
    message: {
      type: String,
      required: [true, "Please provide your message details"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"]
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // Automatically creates 'createdAt' and 'updatedAt' timestamps in your Atlas cluster
    timestamps: true
  }
);

// Compile the schema into a reusable Model and save to the 'contact_submissions' collection
export const Submission = mongoose.model("Submission", submissionSchema, "contact_submissions");
