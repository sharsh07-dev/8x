import sys
import json
import os
import glob
from datetime import datetime, timezone

def main():
    try:
        input_data = json.load(sys.stdin)
    except Exception as e:
        sys.exit(0)
    
    workspace_path = input_data.get('workspacePaths', ['.'])[0]
    logs_dir = os.path.join(workspace_path, '.agent-logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    transcript_path = input_data.get('transcriptPath')
    if not transcript_path:
        sys.exit(0)
        
    transcript_full = transcript_path.replace('transcript.jsonl', 'transcript_full.jsonl')
    session_id = input_data.get('conversationId', 'unknown-session')
    model_name = input_data.get('modelName', 'gemini-3.1-pro')
    
    exchanges = []
    current_prompt = None
    current_response = []
    first_prompt_time = None
    last_prompt_time = None
    
    if os.path.exists(transcript_full):
        with open(transcript_full, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip(): continue
                try:
                    step = json.loads(line)
                except:
                    continue
                
                step_type = step.get('type')
                source = step.get('source')
                
                if step_type == 'USER_INPUT' and source == 'USER_EXPLICIT':
                    if current_prompt is not None:
                        exchanges.append((current_prompt, current_response))
                        current_response = []
                    
                    current_prompt = step
                    ts = step.get('created_at')
                    if first_prompt_time is None:
                        first_prompt_time = ts
                    last_prompt_time = ts
                
                elif step_type == 'PLANNER_RESPONSE' and source == 'MODEL':
                    content = step.get('content')
                    if content and current_prompt is not None:
                        # Sometimes content has multiple items? No, it's string.
                        current_response.append({
                            'content': content,
                            'timestamp': step.get('created_at')
                        })
    
        if current_prompt is not None:
            exchanges.append((current_prompt, current_response))
            
    if not exchanges:
        sys.exit(0)
        
    date_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    if first_prompt_time:
        try:
            dt = datetime.strptime(first_prompt_time, "%Y-%m-%dT%H:%M:%SZ")
            date_str = dt.strftime('%Y-%m-%d')
            time_str = dt.strftime('%H-%M-%S')
        except:
            time_str = datetime.now(timezone.utc).strftime('%H-%M-%S')
    else:
        time_str = datetime.now(timezone.utc).strftime('%H-%M-%S')
        
    filename = f"{date_str}_{time_str}_{session_id}.md"
    file_path = os.path.join(logs_dir, filename)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write("---\n")
        f.write(f"session_id: {session_id}\n")
        f.write(f"date: {date_str}\n")
        f.write(f"author: harshshinde\n")
        f.write(f"model: {model_name}\n")
        f.write(f"tool: antigravity-ide\n")
        f.write(f"project: 8x\n")
        f.write(f"total_exchanges: {len(exchanges)}\n")
        f.write(f"first_prompt_time: {first_prompt_time or ''}\n")
        f.write(f"last_prompt_time: {last_prompt_time or ''}\n")
        f.write("---\n\n")
        f.write(f"# Session Log - {date_str}\n\n")
        f.write(f"Session: `{session_id[:8]}` | Project: `8x` | Author: `harshshinde`\n\n")
        f.write("---\n\n")
        
        for i, (prompt, responses) in enumerate(exchanges, 1):
            f.write(f"[LOG_ENTRY type=PROMPT num={i} session={session_id[:8]}]\n")
            f.write(f"timestamp: {prompt.get('created_at')}\n")
            f.write(f"model: {model_name}\n\n")
            # Strip out internal tags if needed, but requirements say "verbatim and in full".
            prompt_content = prompt.get('content', '')
            # Optional: remove the <USER_REQUEST> <ADDITIONAL_METADATA> injected by antigravity if the user only wants their prompt. 
            # But the prompt says verbatim, so let's just write it.
            f.write(f"{prompt_content}\n\n\n")
            
            f.write(f"[LOG_ENTRY type=RESPONSE num={i} session={session_id[:8]}]\n")
            # Get the timestamp of the last response
            resp_ts = responses[-1]['timestamp'] if responses else ''
            f.write(f"timestamp: {resp_ts}\n")
            f.write(f"model: {model_name}\n\n")
            if responses:
                resp_content = "\\n\\n".join([r['content'] for r in responses])
                f.write(f"{resp_content}\n\n\n")
            else:
                f.write("\n\n\n")
                
    # Output something to stdout as required by hook contract
    print(json.dumps({"decision": "continue", "reason": "Logged session."}))

if __name__ == '__main__':
    main()
