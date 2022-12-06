import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: mongoose.Schema.Types.ObjectId
}, {timestamps: true});


NotificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {
    const data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationType: notificationType,
        entityId: entityId
    };
    await Notification.deleteOne(data).catch(err => console.log(err));
    return Notification.create(data).catch(err => console.log(err));
};

// Register models
const Notification = mongoose.model('Notification', NotificationSchema);

export {
  Notification
};