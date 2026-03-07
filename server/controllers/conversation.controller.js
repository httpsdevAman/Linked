import Conversation from "../models/conversation.js";

export const createConversation = async (req, res) => {
  try {

    const currentUserId = req.user._id;

    const {
      participantIds = [],   // array of users for group
      userId,                // single user for DM
      isGroup = false,
      groupName
    } = req.body;

    // ONE TO ONE CHAT
    if (!isGroup) {

      if (!userId) {
        return res.status(400).json({
          message: "User ID required"
        });
      }

      if (userId === currentUserId.toString()) {
        return res.status(400).json({
          message: "Cannot chat with yourself"
        });
      }

      // check existing DM
      const existingConversation =
        await Conversation.findOne({
          isGroup: false,
          participants: {
            $all: [currentUserId, userId]
          }
        }).populate("participants", "username name");

      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }

      const conversation = await Conversation.create({
        participants: [currentUserId, userId],
        isGroup: false
      });

      const populated = await Conversation.findById(conversation._id)
        .populate("participants", "username name");

      return res.status(201).json(populated);
    }

    // GROUP CHAT

    if (!groupName) {
      return res.status(400).json({
        message: "Group name required"
      });
    }

    if (!participantIds.length) {
      return res.status(400).json({
        message: "Participants required"
      });
    }

    // include creator automatically
    const participants = [
      ...new Set([
        ...participantIds,
        currentUserId.toString()
      ])
    ];

    const groupConversation =
      await Conversation.create({
        participants,
        isGroup: true,
        groupName
      });

    const populated =
      await Conversation.findById(groupConversation._id)
        .populate("participants", "username name");

    return res.status(201).json(populated); 

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// GET YOUR CONVERSATIONS
export const getYourConversations = async (req, res) => {
  try {
    const conversations = await Conversation
      .find({
        participants: req.user._id
      })
      .populate("participants", "username name")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username name"
        }
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};