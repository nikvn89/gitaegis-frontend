# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *

class Contract(gl.Contract):
    bounties_str: str
    next_id_str: str

    def __init__(self):
        self.bounties_str = "{}"
        self.next_id_str = "1"

    @gl.public.write.payable
    def create_bounty(self, issue_url: str, min_score: int) -> str:
        amt = gl.message.value
        if amt == u256(0):
            raise gl.vm.UserError("Reward amount must be greater than 0")
            
        bounties = json.loads(self.bounties_str)
        b_id = self.next_id_str
        self.next_id_str = str(int(self.next_id_str) + 1)
        
        bounties[b_id] = {
            "maintainer": str(gl.message.sender_address.as_hex),
            "issue_url": issue_url,
            "reward_amount": str(amt),
            "min_score": min_score,
            "status": "OPEN",
            "contributor": "",
            "pr_url": ""
        }
        
        self.bounties_str = json.dumps(bounties)
        return b_id

    @gl.public.write
    def claim_bounty(self, b_id: str, pr_url: str, contributor: str) -> None:
        bounties = json.loads(self.bounties_str)
        if b_id not in bounties:
            raise gl.vm.UserError("Bounty not found")
            
        b = bounties[b_id]
        if b["status"] != "OPEN":
            raise gl.vm.UserError("Bounty is not open")
            
        b["pr_url"] = pr_url
        b["contributor"] = contributor
        
        def _ai_resolution() -> int:
            issue_text = gl.nondet.web.render(b["issue_url"])
            pr_text = gl.nondet.web.render(b["pr_url"])
            
            prompt = f"""
            Act as an expert Code Reviewer.
            Original Issue: {issue_text}
            Submitted Pull Request: {pr_text}
            
            Evaluate the PR against the Issue. Does it successfully resolve the issue?
            Assign a score from 1 to 100 based on quality and functional correctness.
            
            Output valid JSON exactly like this: {{"score": 85, "feedback": "Your reason here"}}
            """
            
            res = gl.nondet.exec_prompt(prompt)
            try:
                result_json = json.loads(res)
                return int(result_json.get("score", 0))
            except:
                return 0

        # Execute non-deterministic AI logic inside Equivalence Principle
        score = gl.eq_principle.strict_eq(_ai_resolution)
        
        amt = u256(int(b["reward_amount"]))

        if score >= b["min_score"]:
            b["status"] = "RESOLVED"
            _Recipient(Address(b["contributor"])).emit_transfer(value=amt)
        else:
            b["status"] = "FAILED"
            _Recipient(Address(b["maintainer"])).emit_transfer(value=amt)
            
        self.bounties_str = json.dumps(bounties)

    @gl.public.view
    def get_bounty(self, b_id: str) -> str:
        bounties = json.loads(self.bounties_str)
        if b_id in bounties:
            return json.dumps(bounties[b_id])
        return "{}"
