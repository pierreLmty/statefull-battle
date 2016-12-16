package projet;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.ResultSet;

public class QuestionUtil {
	private static Map<String, String> pays;
	
	static{
		pays = new HashMap<String, String>();
		pays.put("Azawad", "Mali");

		pays.put("Brabant", "Belgium");

		pays.put("Katanga", "Democratic Republic of the Congo");

		pays.put("Malacca, Portuguese", "Malaysia");

		pays.put("Saint-Domingue", "Haiti");

		pays.put("South African Republic", "South Africa");

		pays.put("Austria-Hungary", "Austria");
		pays.put("Illyrian Provinces", "Austria");

		pays.put("Van Vilayet", "Turkey");
		pays.put("Ottoman Empire", "Turkey");
		pays.put("Byzantine Empire", "Turkey");

		pays.put("Verdun", "France");
		pays.put("Strasbourg", "France");
		pays.put("Burgundy", "France");

		pays.put("Naples", "Italy");
		pays.put("Piedmont-Sardinia", "Italy");

		pays.put("Soviet Union", "Russia");
		pays.put("Muscovy", "Russia");
		pays.put("East Prussia", "Russia");

		pays.put("Saxony", "Germany");
		pays.put("Holy Roman Empire", "Germany");
		pays.put("Bavaria", "Germany");

		pays.put("Persia", "Iran");

		pays.put("New France", "United-States");
		pays.put("California", "United-States");
		pays.put("Colorado Territory", "United-States");
		pays.put("Roanoke", "United-States");
		pays.put("Acadia", "United-States");

		pays.put("Carthage", "Tunis");

		pays.put("Transcaucasian Federation", "Armenia, Azerbaijan, Georgia");

		pays.put("New South Wales", "Australia");

		pays.put("North West Frontier", "India");

		pays.put("Upper Silesia", "Poland");

		pays.put("Qing dynasty", "China");

		pays.put("Spanish Sahara", "Morocco");

		pays.put("South-West Africa", "Namibia");

		pays.put("Kingdom of Kandy", "Sri Lanka");
	}
	
	public static String getValue(String key){
		
		if(pays.containsKey(key)){
			return pays.get(key);
		}else{
			return key;
		}
		
	}
	
	public static ResultSet execQuery(String uri){
		String request = "prefix dbo: <http://dbpedia.org/ontology/>\n" +
				"prefix dbp: <http://dbpedia.org/property/>\n" +
				"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
				"prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
	
				"SELECT distinct (str(?label1) as ?label) (str(?namePlace1) as ?namePlace) (str(?combatant1) as ?combatant) (str(?date1) as ?date)\n" +
				"WHERE {\n" +
						"?conflit rdf:type dbo:MilitaryConflict .\n" +
						"?conflit dbo:place ?place.\n" +
						"?place dbp:commonName ?namePlace1.\n" +
						"?conflit rdfs:label ?label1.\n" +
						"?conflit dbo:combatant ?combatant1.\n" +
						"?conflit dbo:date ?date1\n" +
				"FILTER regex(?combatant1, \"^[a-z]|^[A-Z]\")\n" +
				"FILTER (!regex(?combatant1, \":\"))\n" +
				"FILTER (lang(?label1)='en')\n" +
				"FILTER (lang(?namePlace1)='en')\n" +
				"} LIMIT 100";
		
		QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, request);
		qexec.setTimeout(60000);
		ResultSet res = qexec.execSelect();
		qexec.close();
		return res;
	}
	
	public static ResultSet execQuery(){
		return execQuery("http://dbpedia.org/sparql/");
	}
	
	public static QuestionEntity preGenerateQuestion(String enonce, String propositionsCorrecte, Random rdm, int type){
		List<String> propositions = new ArrayList<String>(4);
		propositions.add("");
		propositions.add("");
		propositions.add("");
		propositions.add("");
		
		int indiceReponse;
		indiceReponse = rdm.nextInt(4);
		propositions.set(indiceReponse, propositionsCorrecte);
		
		return new QuestionEntity(enonce, propositions, indiceReponse, type);
	}
	
	public static QuestionEntity completeQuestion(QuestionEntity q, List<String> listeFausseRep,Random rdm){
		int indiceReponse = q.getReponse();
		int maxRand = listeFausseRep.size();
		int i=0;
		String s;
		while(i<4)
		{
			s = listeFausseRep.get(rdm.nextInt(maxRand));
			if(i!=indiceReponse){
				if(!q.getPropositions().contains(s))
				{
					q.getPropositions().set(i,s);
					++i;
				}
			}
			else ++i;
		}
		return q;
	}
}
