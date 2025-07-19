export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "time"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "switch"
  | "rating"
  | "location"
  | "payment"
  | "image"
  | "range"
  | "matrix"
  | "divider"
  | "heading"
  | "paragraph"
  | "spacer"

export interface FormValidation {
  required: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  customMessage?: string
  email?: boolean
  url?: boolean
  phone?: boolean
  creditCard?: boolean
}

export interface FormConditional {
  enabled: boolean
  conditions: Array<{
    fieldId: string
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty"
    value: any
    logicalOperator?: "AND" | "OR"
  }>
  action: "show" | "hide" | "require" | "disable" | "skip_to_section"
  targetSectionId?: string
}

export interface FormStyling {
  width: "full" | "half" | "third" | "quarter" | "two-thirds" | "three-quarters"
  alignment: "left" | "center" | "right"
  customCSS?: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: string
  padding?: string
  margin?: string
  fontSize?: string
  fontWeight?: string
}

export interface FormLayout {
  type: "single" | "two-column" | "three-column" | "four-column" | "custom"
  columns: Array<{
    width: string
    fields: string[]
  }>
  gap: string
  alignment: "top" | "center" | "bottom" | "stretch"
}

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  rows?: number
  description?: string
  helpText?: string
  validation: FormValidation
  conditional: FormConditional
  styling: FormStyling
  layout?: FormLayout
  metadata?: {
    createdAt: string
    updatedAt: string
    createdBy?: string
    column?: number
    row?: number
    section?: string
  }
  // New properties for advanced features
  prefix?: string
  suffix?: string
  mask?: string
  autocomplete?: string
  readonly?: boolean
  defaultValue?: any
  calculateValue?: string
  dependencies?: string[]
}

export interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
  layout: FormLayout
  conditional?: FormConditional
  styling?: FormStyling
  collapsible?: boolean
  collapsed?: boolean
  repeatable?: boolean
  maxRepeats?: number
  buttonText?: string
  order: number
}

export interface FormPage {
  id: string
  title: string
  description?: string
  sections: FormSection[]
  navigation?: {
    showPrevious: boolean
    showNext: boolean
    nextButtonText?: string
    previousButtonText?: string
  }
  conditional?: FormConditional
  order: number
}

export interface FormSettings {
  allowMultipleSubmissions: boolean
  requireAuthentication: boolean
  enableAnalytics: boolean
  enableNotifications: boolean
  redirectUrl?: string
  customCSS?: string
  theme: string
  language: string
  // New advanced settings
  multiPage: boolean
  showProgressBar: boolean
  saveProgress: boolean
  autoSave: boolean
  timeLimit?: number
  submitButtonText: string
  resetButtonText: string
  validation: "onSubmit" | "onBlur" | "onChange"
  layout: "vertical" | "horizontal" | "grid"
  animation: "none" | "fade" | "slide" | "bounce"
  responsive: boolean
  accessibility: {
    enabled: boolean
    highContrast: boolean
    screenReader: boolean
    keyboardNavigation: boolean
  }
}

export interface FormProject {
  id: string
  title: string
  description: string
  pages: FormPage[]
  fields: FormField[] // Deprecated - use pages instead
  theme: "modern" | "classic" | "minimal" | "dark" | "colorful" | "glassmorphism" | "neumorphism"
  settings: FormSettings
  createdAt: string
  updatedAt: string
  createdBy?: string
  collaborators?: string[]
  isPublished?: boolean
  publishedUrl?: string
  analytics?: {
    views: number
    submissions: number
    conversionRate: number
    avgCompletionTime: number
    abandonmentRate: number
  }
  version: number
  tags?: string[]
}

export interface FormSchema {
  title: string
  description: string
  pages: FormPage[]
  version: string
  createdAt: string
  settings: FormSettings
}

export interface CollaborationUpdate {
  type:
    | "field_added"
    | "field_updated"
    | "field_deleted"
    | "field_moved"
    | "project_updated"
    | "section_added"
    | "page_added"
  fieldId?: string
  sectionId?: string
  pageId?: string
  field?: FormField
  section?: FormSection
  page?: FormPage
  updates?: Partial<FormField> | Partial<FormSection> | Partial<FormPage>
  projectUpdates?: Partial<FormProject>
  userId: string
  timestamp: number
}

export interface FormTemplate {
  id: string
  title: string
  description: string
  category: string
  pages: FormPage[]
  fields: FormField[] // Deprecated
  preview: string
  isPremium: boolean
  downloads: number
  rating: number
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number
  features: string[]
}

export interface FormTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    success: string
    warning: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      "2xl": string
    }
    fontWeight: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
  spacing: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    "2xl": string
  }
  borderRadius: {
    none: string
    sm: string
    base: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    base: string
    lg: string
    xl: string
  }
}
