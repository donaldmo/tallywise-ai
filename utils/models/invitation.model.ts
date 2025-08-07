import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
  workspace: mongoose.Schema.Types.ObjectId;
  inviter: mongoose.Schema.Types.ObjectId;
  inviteeEmail: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined';
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema: Schema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  inviter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  inviteeEmail: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  role: { type: String, enum: ['admin', 'member', 'guest'], default: 'member' },
}, { timestamps: true });

const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation;