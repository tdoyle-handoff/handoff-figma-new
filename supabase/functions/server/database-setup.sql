-- Create user_profiles table
CREATE OR REPLACE FUNCTION create_user_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    questionnaire_data JSONB DEFAULT NULL,
    questionnaire_complete BOOLEAN DEFAULT FALSE,
    property_address TEXT DEFAULT NULL,
    property_price NUMERIC DEFAULT NULL,
    closing_date DATE DEFAULT NULL,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
  );

  -- Create index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_questionnaire_complete ON user_profiles(questionnaire_complete);
  
  -- Enable Row Level Security
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  
  -- Create RLS policies
  CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
  
  CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
  
  CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
    
END;
$$ LANGUAGE plpgsql;

-- Create user_tasks table
CREATE OR REPLACE FUNCTION create_user_tasks_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    category TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for faster lookups
  CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_tasks_category ON user_tasks(category);
  CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
  CREATE INDEX IF NOT EXISTS idx_user_tasks_due_date ON user_tasks(due_date);
  
  -- Enable Row Level Security
  ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
  
  -- Create RLS policies
  CREATE POLICY "Users can view their own tasks" ON user_tasks
    FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own tasks" ON user_tasks
    FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own tasks" ON user_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can delete their own tasks" ON user_tasks
    FOR DELETE USING (auth.uid() = user_id);
    
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();