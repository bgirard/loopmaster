import { z } from 'zod'

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  artistName: z.string(),
  email: z.email(),
  projects: z.array(z.string()),
  likes: z.array(z.string()),
  isAdmin: z.boolean().default(false),
  expiresAt: z.number(),
})
export type Session = z.infer<typeof SessionSchema>

export const ErrorResponseSchema = z.object({
  message: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export const HealthResponseSchema = z.object({
  status: z.literal('ok').or(z.literal('error')),
  message: z.string().optional(),
})
export type HealthResponse = z.infer<typeof HealthResponseSchema>

export const UserSchema = z.object({
  id: z.string(),
  artistName: z.string(),
  email: z.email(),
  passwordHash: z.string(),
  sentWelcomeEmail: z.boolean().default(false),
  sentBetaEmail: z.boolean().default(false),
  projects: z.array(z.string()).optional(),
  likes: z.array(z.string()).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  isAdmin: z.boolean().optional(),
})
export type User = z.infer<typeof UserSchema>

export const UsersSchema = z.array(UserSchema)
export type Users = z.infer<typeof UsersSchema>

export const AuthLoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})
export type AuthLoginRequest = z.infer<typeof AuthLoginRequestSchema>

export const AuthRegisterRequestSchema = z.object({
  artistName: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
})
export type AuthRegisterRequest = z.infer<typeof AuthRegisterRequestSchema>

export const UpdateArtistNameRequestSchema = z.object({
  artistName: z.string().trim().min(1),
})
export type UpdateArtistNameRequest = z.infer<typeof UpdateArtistNameRequestSchema>

export const CommentRequestSchema = z.object({
  comment: z.string().trim().min(1),
})
export type CommentRequest = z.infer<typeof CommentRequestSchema>

export const CommentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  artistName: z.string(),
  comment: z.string(),
  createdAt: z.number(),
})
export type Comment = z.infer<typeof CommentSchema>

export const LikeSchema = z.object({
  userId: z.string(),
  artistName: z.string(),
})
export type Like = z.infer<typeof LikeSchema>

export const ProjectsResponseSchema = z.object({
  projects: z.array(z.string()),
})
export type ProjectsResponse = z.infer<typeof ProjectsResponseSchema>

export type Project = {
  id: string
  name: string
  code: string
  arrangement?: Arrangement | undefined
  userId: string
  artistName: string
  likes: Like[]
  comments: Comment[]
  remixes: Project[]
  remixOf?: Project | undefined
  isPublic?: boolean | undefined
  createdAt: number
  updatedAt: number
}

const ArrangementParamValueSchema = z.union([z.string(), z.number(), z.boolean()])

export const ArrangementTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  volume: z.number(),
  muted: z.boolean(),
  soloed: z.boolean(),
  order: z.number(),
  height: z.number().optional(),
})
export type ArrangementTrack = z.infer<typeof ArrangementTrackSchema>

export const ArrangementBlockSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  startBar: z.number(),
  lengthBars: z.number(),
  name: z.string(),
  color: z.string(),
  templateId: z.string().optional(),
  code: z.string(),
  params: z.record(z.string(), ArrangementParamValueSchema),
  volume: z.number(),
  muted: z.boolean(),
})
export type ArrangementBlock = z.infer<typeof ArrangementBlockSchema>

export const ArrangementSchema = z.object({
  arrangementVersion: z.number(),
  bpm: z.number(),
  tracks: z.array(ArrangementTrackSchema),
  blocks: z.array(ArrangementBlockSchema),
  generatedCode: z.string(),
})
export type Arrangement = z.infer<typeof ArrangementSchema>

export const ProjectSchema: z.ZodType<Project> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    arrangement: ArrangementSchema.optional(),
    userId: z.string(),
    artistName: z.string(),
    likes: z.array(LikeSchema),
    comments: z.array(CommentSchema),
    remixes: z.array(ProjectSchema),
    remixOf: ProjectSchema.optional(),
    isPublic: z.boolean().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
)

export const ProjectsSchema = z.array(ProjectSchema)
export type Projects = z.infer<typeof ProjectsSchema>

export const CreateProjectRequestSchema = z.strictObject({
  name: z.string().min(1),
  code: z.string(),
  arrangement: ArrangementSchema.optional(),
  isPublic: z.boolean(),
  remixOfId: z.string().or(z.null()),
})
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>

export const UpdateProjectRequestSchema = z.object({
  name: z.string().min(1),
  code: z.string(),
  arrangement: ArrangementSchema.optional(),
  isPublic: z.boolean(),
  remixOfId: z.string().or(z.null()),
})
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>

export const OkResponseSchema = z.object({
  ok: z.literal(true),
})
export type OkResponse = z.infer<typeof OkResponseSchema>

export const OneLinerRequestSchema = z.object({
  code: z.string(),
})
export type OneLinerRequest = z.infer<typeof OneLinerRequestSchema>

export const OneLinerSchema = z.object({
  id: z.string(),
  code: z.string(),
  createdAt: z.number(),
})
export type OneLiner = z.infer<typeof OneLinerSchema>

export const OneLinersSchema = z.array(OneLinerSchema)
export type OneLiners = z.infer<typeof OneLinersSchema>

export const GenerateTrackRequestSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.3),
  topP: z.number().min(0).max(1).default(1.0),
  model: z.string().min(1).default('gpt-5.2-chat-latest'),
  prompt: z.string().min(1),
})
export type GenerateTrackRequest = z.infer<typeof GenerateTrackRequestSchema>

export const GenerateTrackResponseSchema = z.object({
  title: z.string(),
  code: z.string(),
})
export type GenerateTrackResponse = z.infer<typeof GenerateTrackResponseSchema>

export const ModifyTrackRequestSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.3),
  topP: z.number().min(0).max(1).default(1.0),
  model: z.string().min(1).default('gpt-5.2-chat-latest'),
  prompt: z.string().min(1),
  currentCode: z.string().min(1),
})
export type ModifyTrackRequest = z.infer<typeof ModifyTrackRequestSchema>

export const ModifyTrackResponseSchema = z.object({
  code: z.string(),
})
export type ModifyTrackResponse = z.infer<typeof ModifyTrackResponseSchema>

export const GenerateSimilarTrackRequestSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.3),
  topP: z.number().min(0).max(1).default(1.0),
  model: z.string().min(1).default('gpt-5.2-chat-latest'),
  currentCode: z.string().min(1),
})
export type GenerateSimilarTrackRequest = z.infer<typeof GenerateSimilarTrackRequestSchema>

export const GenerateSimilarTrackResponseSchema = z.object({
  title: z.string(),
  code: z.string(),
})
export type GenerateSimilarTrackResponse = z.infer<typeof GenerateSimilarTrackResponseSchema>
