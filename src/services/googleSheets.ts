// backend.gs - ATUALIZADO COM NOVAS COLUNAS

const SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
const SHEET_CANDIDATOS = 'CANDIDATOS';
const SHEET_USUARIOS = 'USUARIOS';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// ================== FUNÇÕES DE USUÁRIOS ==================
function getUserRole(e) {
  const userEmail = e.parameter.email;
  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_USUARIOS);
  
  if (!userSheet) {
    return createResponse({error: 'Planilha de usuários não encontrada'}, 404);
  }
  
  const data = userSheet.getDataRange().getValues();
  const headers = data[0];
  
  const emailIndex = headers.indexOf('Email');
  const roleIndex = headers.indexOf('Role');
  const ativoIndex = headers.indexOf('Ativo');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[emailIndex] === userEmail && row[ativoIndex] === true) {
      return createResponse({
        role: row[roleIndex],
        email: row[emailIndex],
        nome: row[headers.indexOf('Nome')]
      });
    }
  }
  
  return createResponse({error: 'Usuário não encontrado ou inativo'}, 404);
}

function getAllUsers(e) {
  const requesterEmail = e.parameter.requesterEmail;
  const requesterRole = getUserRoleFromSheet(requesterEmail);
  
  if (requesterRole !== 'admin') {
    return createResponse({error: 'Acesso negado. Apenas administradores.'}, 403);
  }
  
  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_USUARIOS);
  const data = userSheet.getDataRange().getValues();
  const headers = data[0];
  
  const users = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const user = {};
    headers.forEach((header, index) => {
      user[header] = row[index];
    });
    users.push(user);
  }
  
  return createResponse({users});
}

function updateUserRole(e) {
  const { requesterEmail, targetEmail, newRole } = e.parameter;
  
  const requesterRole = getUserRoleFromSheet(requesterEmail);
  if (requesterRole !== 'admin') {
    return createResponse({error: 'Acesso negado. Apenas administradores.'}, 403);
  }
  
  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_USUARIOS);
  const data = userSheet.getDataRange().getValues();
  const headers = data[0];
  
  const emailIndex = headers.indexOf('Email');
  const roleIndex = headers.indexOf('Role');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIndex] === targetEmail) {
      userSheet.getRange(i + 1, roleIndex + 1).setValue(newRole);
      return createResponse({success: true, message: 'Role atualizada com sucesso'});
    }
  }
  
  return createResponse({error: 'Usuário não encontrado'}, 404);
}

function getUserRoleFromSheet(email) {
  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_USUARIOS);
  const data = userSheet.getDataRange().getValues();
  const headers = data[0];
  
  const emailIndex = headers.indexOf('Email');
  const roleIndex = headers.indexOf('Role');
  const ativoIndex = headers.indexOf('Ativo');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[emailIndex] === email && row[ativoIndex] === true) {
      return row[roleIndex];
    }
  }
  return null;
}

// ================== FUNÇÕES DE CANDIDATOS ==================
function getCandidates(e) {
  try {
    const ss = getSpreadsheet();
    const candidateSheet = ss.getSheetByName(SHEET_CANDIDATOS);
    
    if (!candidateSheet) {
      return createResponse({error: 'Planilha de candidatos não encontrada'}, 404);
    }
    
    const data = candidateSheet.getDataRange().getValues();
    const headers = data[0];
    
    const candidates = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const candidate = {};
      
      // Mapear todas as colunas baseado nos headers
      headers.forEach((header, index) => {
        candidate[header] = row[index];
      });
      
      candidates.push(candidate);
    }
    
    return createResponse({candidates, headers});
  } catch (error) {
    return createResponse({error: error.message}, 500);
  }
}

function addCandidate(e) {
  try {
    const ss = getSpreadsheet();
    const candidateSheet = ss.getSheetByName(SHEET_CANDIDATOS);
    
    if (!candidateSheet) {
      return createResponse({error: 'Planilha de candidatos não encontrada'}, 404);
    }
    
    const data = candidateSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Verificar se CPF já existe
    const cpfIndex = headers.indexOf('CPF');
    const newCPF = e.parameter.CPF;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][cpfIndex] === newCPF) {
        return createResponse({error: 'CPF já cadastrado'}, 400);
      }
    }
    
    // Preparar nova linha com as novas colunas
    const newRow = [];
    headers.forEach(header => {
      switch(header) {
        case 'DataCadastro':
          newRow.push(new Date());
          break;
        case 'Status':
          newRow.push('Ativo');
          break;
        default:
          newRow.push(e.parameter[header] || '');
      }
    });
    
    candidateSheet.appendRow(newRow);
    
    return createResponse({success: true, message: 'Candidato cadastrado com sucesso'});
  } catch (error) {
    return createResponse({error: error.message}, 500);
  }
}

function updateCandidate(e) {
  try {
    const { candidateCPF, ...updateData } = e.parameter;
    const ss = getSpreadsheet();
    const candidateSheet = ss.getSheetByName(SHEET_CANDIDATOS);
    
    const data = candidateSheet.getDataRange().getValues();
    const headers = data[0];
    
    const cpfIndex = headers.indexOf('CPF');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][cpfIndex] === candidateCPF) {
        headers.forEach((header, index) => {
          if (updateData[header] !== undefined && header !== 'CPF') {
            candidateSheet.getRange(i + 1, index + 1).setValue(updateData[header]);
          }
        });
        
        return createResponse({success: true, message: 'Candidato atualizado com sucesso'});
      }
    }
    
    return createResponse({error: 'Candidato não encontrado'}, 404);
  } catch (error) {
    return createResponse({error: error.message}, 500);
  }
}

function deleteCandidate(e) {
  try {
    const candidateCPF = e.parameter.candidateCPF;
    const ss = getSpreadsheet();
    const candidateSheet = ss.getSheetByName(SHEET_CANDIDATOS);
    
    const data = candidateSheet.getDataRange().getValues();
    const headers = data[0];
    
    const cpfIndex = headers.indexOf('CPF');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][cpfIndex] === candidateCPF) {
        candidateSheet.deleteRow(i + 1);
        return createResponse({success: true, message: 'Candidato excluído com sucesso'});
      }
    }
    
    return createResponse({error: 'Candidato não encontrado'}, 404);
  } catch (error) {
    return createResponse({error: error.message}, 500);
  }
}

// ================== FUNÇÃO PRINCIPAL ==================
function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const action = e.parameter.action;
    
    const actions = {
      // Usuários
      'getUserRole': getUserRole,
      'getAllUsers': getAllUsers,
      'updateUserRole': updateUserRole,
      
      // Candidatos
      'getCandidates': getCandidates,
      'addCandidate': addCandidate,
      'updateCandidate': updateCandidate,
      'deleteCandidate': deleteCandidate
    };
    
    if (actions[action]) {
      return actions[action](e);
    } else {
      return createResponse({error: 'Ação não encontrada'}, 404);
    }
  } catch (error) {
    return createResponse({error: error.message}, 500);
  }
}

function createResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setStatusCode(statusCode);
}
