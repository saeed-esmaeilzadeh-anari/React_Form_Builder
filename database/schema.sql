-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (handled by Supabase Auth)
-- We'll use auth.users and create a profiles table for additional data

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  company TEXT,
  website TEXT,
  bio TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forms table
CREATE TABLE public.forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  theme TEXT DEFAULT 'modern' CHECK (theme IN ('modern', 'classic', 'minimal', 'dark', 'colorful')),
  is_published BOOLEAN DEFAULT FALSE,
  published_url TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form submissions table
CREATE TABLE public.form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form analytics table
CREATE TABLE public.form_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL UNIQUE,
  views INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  geographic_data JSONB DEFAULT '{}',
  device_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form events table for detailed analytics
CREATE TABLE public.form_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'submission', 'error')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form collaborators table
CREATE TABLE public.form_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'admin')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(form_id, user_id)
);

-- Form templates table
CREATE TABLE public.form_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  preview_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User permissions table
CREATE TABLE public.user_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource, action)
);

-- Indexes for performance
CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_published ON public.forms(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitted_at ON public.form_submissions(submitted_at);
CREATE INDEX idx_form_events_form_id ON public.form_events(form_id);
CREATE INDEX idx_form_events_created_at ON public.form_events(created_at);
CREATE INDEX idx_form_collaborators_form_id ON public.form_collaborators(form_id);
CREATE INDEX idx_form_collaborators_user_id ON public.form_collaborators(user_id);

-- Functions for analytics
CREATE OR REPLACE FUNCTION increment_form_views(form_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.form_analytics (form_id, views)
  VALUES (form_id, 1)
  ON CONFLICT (form_id)
  DO UPDATE SET 
    views = form_analytics.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_form_submissions(form_id UUID)
RETURNS VOID AS $$
DECLARE
  current_views INTEGER;
  current_submissions INTEGER;
  new_conversion_rate DECIMAL(5,2);
BEGIN
  -- Get current stats
  SELECT views, submissions INTO current_views, current_submissions
  FROM public.form_analytics
  WHERE form_analytics.form_id = increment_form_submissions.form_id;
  
  -- Calculate new conversion rate
  new_conversion_rate := CASE 
    WHEN current_views > 0 THEN ((current_submissions + 1)::DECIMAL / current_views::DECIMAL) * 100
    ELSE 0
  END;
  
  -- Update analytics
  INSERT INTO public.form_analytics (form_id, submissions, conversion_rate)
  VALUES (form_id, 1, new_conversion_rate)
  ON CONFLICT (form_id)
  DO UPDATE SET 
    submissions = form_analytics.submissions + 1,
    conversion_rate = new_conversion_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_analytics_updated_at
  BEFORE UPDATE ON public.form_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at
  BEFORE UPDATE ON public.form_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own forms" ON public.forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own forms" ON public.forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON public.forms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON public.forms
  FOR DELETE USING (auth.uid() = user_id);

-- Public forms can be viewed by anyone
CREATE POLICY "Published forms are viewable by anyone" ON public.forms
  FOR SELECT USING (is_published = TRUE);

-- Form submissions policies
CREATE POLICY "Form owners can view submissions" ON public.form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_submissions.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Analytics policies
CREATE POLICY "Form owners can view analytics" ON public.form_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_analytics.form_id 
      AND forms.user_id = auth.uid()
    )
  );
