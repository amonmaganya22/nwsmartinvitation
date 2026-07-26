import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Inasoma API Keys kutoka kwenye .env.local (au Vercel Env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = (formData.get('file') as File) || (formData.get('image') as File)

    if (!file) {
      return NextResponse.json(
        { error: 'Hakuna picha iliyochaguliwa' },
        { status: 400 }
      )
    }

    // Kutengeneza jina la kipekee la picha (e.g. 1722000000-xyz.jpg)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Convert File kuwa Buffer kwa ajili ya Upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload picha kuelekea Supabase Storage Bucket linaloitwa 'covers'
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Chukua Link ya picha kutoka Supabase (Public URL)
    const { data: publicUrlData } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName)

    // Rudisha URL ya picha kuelekea Frontend
    return NextResponse.json({ url: publicUrlData.publicUrl })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Kuna tatizo limetokea wakati wa ku-upload' },
      { status: 500 }
    )
  }
}