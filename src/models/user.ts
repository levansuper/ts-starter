import { Document, Schema, Model, model } from 'mongoose';

export interface UserModel extends Document {
	username: string;
	password: string;
	firstName: string;
	lastName: string;
	email: string;
	agreement: boolean;
	role: string;
	invitationToken: string;
	invitationTokenSendDate: Date;
	passwordResetToken: string;
	passwordResetTokenSendDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

export var UserSchema: Schema = new Schema(
	{
		username: { type: String, unique: true, required: true },
		password: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: false, unique: true, sparse: true },
		agreement: { type: Boolean, required: true },
		role: { type: String },
		invitationToken: { type: String },
		invitationTokenSendDate: { type: Date },
		passwordResetToken: { type: String },
		passwordResetTokenSendDate: { type: Date }
	},
	{
		collection: 'users',
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt'
		}
	}
);

export const UserModel: Model<UserModel> = model<UserModel>('User', UserSchema);
