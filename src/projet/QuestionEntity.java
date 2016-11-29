package projet;

import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType=IdentityType.APPLICATION)
public class QuestionEntity {
	@PrimaryKey
	@Persistent(valueStrategy=IdGeneratorStrategy.IDENTITY)
	String id;

	@Persistent
	String enonce;
	
	@Persistent
	List<String> propositions;
	
	@Persistent
	int reponse;
	
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getQuestion() {
		return enonce;
	}
	
	public void setQuestion(String question) {
		this.enonce = question;
	}
	
	public List<String> getPropositions() {
		return this.propositions;
	}
	
	public void setPropositions(List<String> propositions){
		this.propositions = propositions;
	}
	
	public int getReponse() {
		return reponse;
	}
	
	public void setReponse(int reponse) {
		this.reponse = reponse;
	}
}