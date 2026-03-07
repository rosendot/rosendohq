import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeDocumentInsert } from '@/types/database.types';

export async function GET(request: Request) {
    const supabase = await createClient();
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const applianceId = searchParams.get('applianceId');
        const projectId = searchParams.get('projectId');
        const documentType = searchParams.get('type');

        let query = supabase
            .from('home_document')
            .select('*')
            .order('created_at', { ascending: false });

        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        if (applianceId) {
            query = query.eq('appliance_id', applianceId);
        }

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        if (documentType) {
            query = query.eq('document_type', documentType);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const body: HomeDocumentInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Document name is required' }, { status: 400 });
        }

        if (!body.document_type) {
            return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
        }

        const insertData: HomeDocumentInsert = {
            property_id: body.property_id || null,
            appliance_id: body.appliance_id || null,
            project_id: body.project_id || null,
            document_type: body.document_type,
            name: body.name.trim(),
            description: body.description?.trim() || null,
            file_url: body.file_url?.trim() || null,
            file_id: body.file_id || null,
            expiration_date: body.expiration_date || null,
            issue_date: body.issue_date || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_document')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}
