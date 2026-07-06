# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
from dataclasses import dataclass

@allow_storage
@dataclass
class BountyData:
    maintainer: str
    issue_url: str
    reward_amount: bigint
    min_score: bigint
    status: str
    contributor: str
    feedback: str

class GitAegis(gl.Contract):
    bounties: TreeMap[str, BountyData]
    next_bounty_id: bigint
    contract_balance: bigint

    def __init__(self):
        self.next_bounty_id = bigint(1)
        self.contract_balance = bigint(0)
        
    @gl.public.write
    def fund_contract(self) -> None:
        amt = gl.message.value if hasattr(gl.message, "value") else bigint(0)
        self.contract_balance += amt

    @gl.public.write
    def create_bounty(self, maintainer: str, issue_url: str, min_score: int) -> str:
        reward = gl.message.value if hasattr(gl.message, "value") else bigint(0)
        
        if min_score < 1 or min_score > 100:
            raise gl.vm.UserError("min_score must be between 1 and 100")
            
        bounty_id = str(self.next_bounty_id)
        
        self.bounties[bounty_id] = BountyData(
            maintainer=maintainer,
            issue_url=issue_url,
            reward_amount=reward,
            min_score=bigint(min_score),
            status="OPEN",
            contributor="",
            feedback=""
        )
        self.next_bounty_id += bigint(1)
        return bounty_id

    @gl.public.write
    def claim_bounty(self, bounty_id: str, pr_url: str) -> None:
        if bounty_id not in self.bounties:
            raise gl.vm.UserError("Bounty not found")
            
        bounty = self.bounties[bounty_id]
        
        if bounty.status != "OPEN":
            raise gl.vm.UserError("Bounty is not OPEN")

        iss_url = bounty.issue_url
        pr_link = pr_url

        def leader_fn() -> str:
            try:
                issue_content = gl.nondet.web.render(iss_url, mode="text")[:4000]
                pr_content = gl.nondet.web.render(pr_link, mode="text")[:4000]
            except Exception:
                return json.dumps({"is_match": False, "score": 0, "feedback": "Fetch failed"}, sort_keys=True)
                
            prompt = (
                "You are a Senior Code Auditor. Match the GitHub Issue requirements with the PR code.\n"
                "ISSUE:\n" + issue_content + "\n"
                "PR:\n" + pr_content + "\n"
                "Return exactly a JSON object: {\"is_match\": true/false, \"score\": integer 0-100, \"feedback\": \"brief reason\"}"
            )
            
            ai_resp = gl.nondet.exec_prompt(prompt)
            
            try:
                parsed = json.loads(ai_resp)
                match = bool(parsed.get("is_match", False))
                try:
                    score = int(parsed.get("score", 0))
                except Exception:
                    score = 0
                feedback = str(parsed.get("feedback", ""))[:200]
                return json.dumps({"is_match": match, "score": score, "feedback": feedback}, sort_keys=True)
            except Exception:
                return json.dumps({"is_match": False, "score": 0, "feedback": "Parse failed"}, sort_keys=True)

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            try:
                l_data = json.loads(leader_res.value)
                v_data = json.loads(leader_fn())
                
                # Check semantic match
                if l_data.get("is_match") != v_data.get("is_match"): return False
                
                # Banding score consensus
                def band(s: int) -> int:
                    if s < 50: return 0
                    if s < 80: return 1
                    return 2
                    
                if band(int(l_data.get("score", 0))) != band(int(v_data.get("score", 0))): return False
                return True
            except Exception:
                return False

        final_res = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        ai_result = json.loads(final_res)
        
        is_match = ai_result["is_match"]
        score = int(ai_result["score"])
        
        if is_match and score >= int(bounty.min_score):
            bounty.status = "RESOLVED"
            bounty.contributor = str(gl.message.sender)
            bounty.feedback = ai_result["feedback"]
        else:
            bounty.feedback = ai_result["feedback"]

    @gl.public.view
    def get_bounty(self, bounty_id: str) -> str:
        if bounty_id in self.bounties:
            b = self.bounties[bounty_id]
            return json.dumps({
                "maintainer": b.maintainer,
                "issue_url": b.issue_url,
                "reward_amount": int(b.reward_amount),
                "min_score": int(b.min_score),
                "status": b.status,
                "contributor": b.contributor,
                "feedback": b.feedback
            })
        return "{}"
