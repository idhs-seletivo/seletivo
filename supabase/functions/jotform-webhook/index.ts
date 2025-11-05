import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface JotformSubmission {
  submissionID: string;
  formID: string;
  ip: string;
  created_at: string;
  status: string;
  new: string;
  flag: string;
  notes: string;
  updated_at: string | null;
  answers: Record<string, {
    name: string;
    order: string;
    text: string;
    type: string;
    answer?: string | string[];
    prettyFormat?: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const contentType = req.headers.get('content-type') || '';
    let rawSubmission: JotformSubmission;

    if (contentType.includes('application/json')) {
      rawSubmission = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const rawSubmissionText = formData.get('rawRequest');
      if (typeof rawSubmissionText === 'string') {
        rawSubmission = JSON.parse(rawSubmissionText);
      } else {
        throw new Error('Invalid form data');
      }
    } else {
      throw new Error('Unsupported content type');
    }

    const answers = rawSubmission.answers || {};

    const extractAnswer = (questionId: string): string => {
      const answer = answers[questionId]?.answer;
      if (Array.isArray(answer)) {
        return answer.filter(Boolean).join(' ');
      }
      return answer?.toString() || '';
    };

    const extractText = (questionId: string): string => {
      return answers[questionId]?.text || answers[questionId]?.prettyFormat || '';
    };

    const area = extractAnswer('area') || extractText('area');
    
    const candidate = {
      registration_number: rawSubmission.submissionID,
      submission_date: rawSubmission.created_at,
      name: extractAnswer('nome') || extractText('nome'),
      cpf: extractAnswer('cpf') || extractText('cpf'),
      area: area,
      cargo_administrativo: area === 'Administrativa' ? (extractAnswer('cargo') || extractText('cargo')) : '',
      cargo_assistencial: area === 'Assistencial' ? (extractAnswer('cargo') || extractText('cargo')) : '',
      adm_curriculo: area === 'Administrativa' ? extractAnswer('curriculo') : '',
      adm_diploma: area === 'Administrativa' ? extractAnswer('diploma') : '',
      adm_documentos: area === 'Administrativa' ? extractAnswer('documentos') : '',
      adm_cursos: area === 'Administrativa' ? extractAnswer('cursos') : '',
      assist_curriculo: area === 'Assistencial' ? extractAnswer('curriculo') : '',
      assist_diploma: area === 'Assistencial' ? extractAnswer('diploma') : '',
      assist_carteira: area === 'Assistencial' ? extractAnswer('carteira') : '',
      assist_cursos: area === 'Assistencial' ? extractAnswer('cursos') : '',
      assist_documentos: area === 'Assistencial' ? extractAnswer('documentos') : '',
      status_triagem: '',
      data_hora_triagem: '',
      analista_triagem: '',
      rejection_reasons: [],
      notes: '',
      priority: 0,
      flagged: false
    };

    const { data, error } = await supabase
      .from('candidates')
      .upsert(candidate, { onConflict: 'registration_number' })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});