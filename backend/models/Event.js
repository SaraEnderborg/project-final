import mongoose, { Schema } from "mongoose";

const SourceSchema = new Schema({ label: String, url: String }, { _id: false });

const WikimediaSchema = new Schema(
  { imageUrl: String, credit: String, licenseUrl: String },
  { _id: false },
);

const EventSchema = new Schema(
  {
    layerId: {
      type: Schema.Types.ObjectId,
      ref: "Layer",
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    summary: { type: String },

    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },

    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    location: { type: String },

    sources: { type: [SourceSchema], default: [] },
    wikimedia: { type: WikimediaSchema },
    externalIds: {
      wikidataQid: { type: String, index: true },
    },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true },
);

EventSchema.index({ layerId: 1, startDate: 1 });
EventSchema.index({ layerId: 1, category: 1, startDate: 1 });

EventSchema.index(
  { layerId: 1, "externalIds.wikidataQid": 1 },
  {
    unique: true,
    partialFilterExpression: { "externalIds.wikidataQid": { $type: "string" } },
  },
);

export default mongoose.model("Event", EventSchema);
