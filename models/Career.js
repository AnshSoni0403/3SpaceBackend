const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
    JobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        
        maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    Field: {
        type: String,
        required: [true, 'Field is required'],
        enum: {
            values: ['Engineering', 'Software', 'Production', 'Operations'],
            message: '{VALUE} is not a valid field'
        },
        
    },
    workType: {
        type: String,
        required: [true, 'Work type is required'],
        enum: {
            values: ['Remote', 'Office', 'Hybrid'],
            message: '{VALUE} is not a valid work type'
        },
        
    },
    employmentType: {
        type: String,
        required: [true, 'Employment type is required'],
        enum: {
            values: ['Full Time', 'Part Time', 'Contract'],
            message: '{VALUE} is not a valid employment type'
        },
        
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    responsibilities: {
        type: [String],
        required: [true, 'At least one responsibility is required'],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: 'At least one responsibility is required'
        },
        default: undefined // Ensures empty array won't pass validation
    },
    requirements: {
        type: [String],
        required: [true, 'At least one requirement is required'],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: 'At least one requirement is required'
        },
        default: undefined // Ensures empty array won't pass validation
    },
    isActive: {
        type: Boolean,
        default: true
    },
    postedAt: {
        type: Date,
        default: Date.now,
        immutable: true // Prevents modification after creation
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true } // Include virtuals when converting to objects
});

// Add text index for search functionality
careerSchema.index({
    JobTitle: 'text',
    description: 'text',
    responsibilities: 'text',
    requirements: 'text'
});

// Virtual for formatted posting date
careerSchema.virtual('postedDate').get(function() {
    return this.postedAt ? this.postedAt.toLocaleDateString() : new Date().toLocaleDateString();
});

// Set default postedAt date if not provided
careerSchema.pre('save', function(next) {
    if (!this.postedAt) {
        this.postedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Career', careerSchema);