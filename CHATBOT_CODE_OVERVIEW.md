// COMPLETE REPLACEMENT FOR generateRAGAnswer function in server/index.js

function generateRAGAnswer(query, chunkResults) {
  if (chunkResults.length === 0) {
    return "I couldn't find any relevant information in the uploaded documents.";
  }
  
  const queryLower = query.toLowerCase();
  
  // Extract main keywords (remove stop words and question words)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'what', 'who', 'when', 'where', 'why', 'how', 'which', 'can', 'you', 'show', 'me', 'tell', 'give', 'get', 'find', 'about', 'info', 'information']);
  
  const keywords = queryLower
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  
  console.log('🔑 Keywords extracted:', keywords);
  
  // Detect query intent
  const isContactQuery = /contact|email|phone|number|reach/i.test(queryLower);
  const isListQuery = /list|all|show|members|everyone/i.test(queryLower);
  const isPersonQuery = keywords.some(k => /^[A-Z]/.test(query) && query.includes(k));
  
  console.log('📋 Query type - Contact:', isContactQuery, 'List:', isListQuery, 'Person:', isPersonQuery);
  
  // Find the BEST matching chunk with actual answer content
  let bestChunk = null;
  let bestScore = 0;
  
  for (const chunk of chunkResults.slice(0, 8)) {
    const chunkLower = chunk.chunk.toLowerCase();
    let score = chunk.score;
    
    // Boost chunks that have actual answer content
    if (isContactQuery) {
      // Count email and phone patterns
      const emailCount = (chunk.chunk.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
      const phoneCount = (chunk.chunk.match(/\d{3}[-.)]\d{3}[-.)]\d{4}/g) || []).length;
      score += (emailCount * 50) + (phoneCount * 50);
    }
    
    // Boost chunks with list-like structure
    if (isListQuery) {
      const bulletPoints = (chunk.chunk.match(/^[\s]*[•●\-\*]/gm) || []).length;
      const colonLines = (chunk.chunk.match(/[A-Z][a-z]+.*:/g) || []).length;
      score += (bulletPoints * 30) + (colonLines * 30);
    }
    
    // Penalize chunks with unrelated content
    const irrelevantPhrases = ['academic hearing', 'voted on by', 'if members cannot', 'shall collect', 'deposit them'];
    for (const phrase of irrelevantPhrases) {
      if (chunkLower.includes(phrase)) {
        score -= 100;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestChunk = chunk;
    }
  }
  
  if (!bestChunk) {
    return "I couldn't find a specific answer to that question in the documents.";
  }
  
  console.log('✅ Selected chunk with score:', bestScore);
  
  // Extract answer from the best chunk
  const lines = bestChunk.chunk.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const relevantLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    // Skip lines with irrelevant content
    if (/academic hearing|voted on|cannot afford|shall collect|deposit them|assess any additional/i.test(line)) {
      continue;
    }
    
    // For contact queries, include lines with contact info
    if (isContactQuery || isListQuery) {
      const hasContactInfo = /@|phone|email|\d{3}[-.)]\d{3}[-.)]\d{4}|kappathetapi/i.test(line);
      const hasRole = /president|vice|director|chair|member|executive/i.test(line);
      const hasName = /[A-Z][a-z]+ [A-Z][a-z]+/.test(line);
      
      if (hasContactInfo || hasRole || hasName) {
        relevantLines.push(line);
        
        // Also include next line if it contains contact info
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (/@|phone|email|\d{3}[-.)]\d{3}/i.test(nextLine)) {
            relevantLines.push(nextLine);
            i++; // Skip next iteration
          }
        }
      }
    } else {
      // For other queries, match on keywords
      const matchCount = keywords.filter(kw => lineLower.includes(kw)).length;
      if (matchCount >= Math.max(1, keywords.length * 0.4)) {
        relevantLines.push(line);
      }
    }
    
    // Limit to reasonable amount
    if (relevantLines.length >= 25) break;
  }
  
  if (relevantLines.length === 0) {
    // Fallback: take first reasonable paragraph from best chunk
    const paragraphs = bestChunk.chunk.split('\n\n').filter(p => p.trim().length > 20);
    for (const para of paragraphs) {
      if (!/academic hearing|voted on|cannot afford|shall collect/i.test(para)) {
        return para.trim();
      }
    }
    return "I couldn't extract a clear answer from the documents.";
  }
  
  // Format the answer
  let answer = relevantLines.join('\n');
  
  // Clean up excessive spacing
  answer = answer.replace(/\n{3,}/g, '\n\n');
  
  // Limit length if too long
  if (answer.length > 1500) {
    const limitedLines = relevantLines.slice(0, 20);
    answer = limitedLines.join('\n');
  }
  
  console.log('📝 Final answer length:', answer.length, 'lines:', relevantLines.length);
  
  return answer.trim();
}


// ALSO ADD/UPDATE this helper function to detect question types better

function detectQuestionType(query) {
  const q = query.toLowerCase().trim();
  if (/^(what|what's|whats)\b/.test(q)) return 'what';
  if (/^(who|who's|whos)\b/.test(q)) return 'who';
  if (/^(when|when's|whens)\b/.test(q)) return 'when';
  if (/^(where|where's|wheres)\b/.test(q)) return 'where';
  if (/^(why|how come)\b/.test(q)) return 'why';
  if (/^(how|how's|hows)\b/.test(q)) return 'how';
  if (/\b(contact|phone|email|number|reach)\b/.test(q)) return 'contact';
  if (/\b(list|all|show|everyone)\b/.test(q)) return 'list';
  return 'general';
}