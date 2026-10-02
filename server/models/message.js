import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        content: {
            type: String,
            trim: true,
            default: ""
        },

        attachments: [
            {
                url: {
                    type: String,
                    required: true
                },
                fileType: {
                    type: String
                },
                fileName: {
                    type: String
                },
                fileSize: {
                    type: Number
                }
            }
        ],

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    { timestamps: true }
);

messageSchema.pre('save', async function () {
    if (!this.content && (!this.attachments || this.attachments.length === 0)) {
        throw new Error(
            'A message must contain either text content or an attachment.'
        );
    }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;