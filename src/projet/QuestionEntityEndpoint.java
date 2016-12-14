package projet;

import projet.PMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "questionentityendpoint", namespace = @ApiNamespace(ownerDomain = "mycompany.com", ownerName = "mycompany.com", packagePath = "services"))
public class QuestionEntityEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listScoreEntity")
	public CollectionResponse<ScoreEntity> listScoreEntity(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<ScoreEntity> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(ScoreEntity.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<ScoreEntity>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (ScoreEntity obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<ScoreEntity> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}
	
	@ApiMethod(name = "addQuestions")
	public void addQuestions(@Nullable @Named("uri") String uri)
	{
		List<QuestionEntity> questionCombattantList = new LinkedList<QuestionEntity>();
		List<QuestionEntity> questionNamePlaceList = new LinkedList<QuestionEntity>();
		List<QuestionEntity> questionDateList = new LinkedList<QuestionEntity>();
	
		ResultSet results = execQuery();
		QuerySolution qs;
		
		List<String> combattantList = new LinkedList<String>();
		List<String> namePlaceList = new LinkedList<String>();
		List<String> dateList = new LinkedList<String>();
		Random rdm = new Random();
		for (; results.hasNext();) {
			qs = results.next();
			
			combattantList.add(qs.get("combatant").toString());
			namePlaceList.add(qs.get("namePlace").toString());
			dateList.add(qs.get("date").toString());
			
			questionCombattantList.add(preGenerateQuestion("Who took part in "+ qs.get("label") +" ? ",qs.get("combatant").toString(),rdm,1));
			questionNamePlaceList.add(preGenerateQuestion("Where took part in "+ qs.get("label") +" ? ",qs.get("namePlace").toString(),rdm,2));
			questionDateList.add(preGenerateQuestion("When took part in "+ qs.get("label") +" ? ",qs.get("date").toString(),rdm,3));
		}
		QuestionEntityEndpoint q = new QuestionEntityEndpoint();
		
		for (QuestionEntity elt:questionCombattantList){
			try{
				q.insertQuestionEntity(completeQuestion(elt,combattantList,rdm));
			}catch(EntityExistsException e){
				
			}
		}
		
		for (QuestionEntity elt:questionNamePlaceList){
			try{
				q.insertQuestionEntity(completeQuestion(elt,namePlaceList,rdm));
			}catch(EntityExistsException e){
				
			}
			
		}
		
		for (QuestionEntity elt:questionDateList){
			try{
				q.insertQuestionEntity(completeQuestion(elt,dateList,rdm));
			}catch(EntityExistsException e){
				
			}
		}
		
	}

	private QuestionEntity preGenerateQuestion(String enonce, String propositionsCorrecte, Random rdm, int type){
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
	
	private QuestionEntity completeQuestion(QuestionEntity q, List<String> listeFausseRep,Random rdm){
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

	
	private ResultSet execQuery(String uri){
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
	
	private ResultSet execQuery(){
		return execQuery("http://dbpedia.org/sparql/");
	}
	
	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getScoreEntity")
	public ScoreEntity getScoreEntity(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		ScoreEntity scoreentity = null;
		try {
			scoreentity = mgr.getObjectById(ScoreEntity.class, id);
		} finally {
			mgr.close();
		}
		return scoreentity;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param scoreentity the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertScoreEntity")
	public ScoreEntity insertScoreEntity(ScoreEntity scoreentity) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(scoreentity.getId() == null){
				scoreentity.setId(Integer.toString(scoreentity.hashCode()));
			}
			if (containsScoreEntity(scoreentity)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(scoreentity);
		} finally {
			mgr.close();
		}
		return scoreentity;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param scoreentity the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateScoreEntity")
	public ScoreEntity updateScoreEntity(ScoreEntity scoreentity) {
		PersistenceManager mgr = getPersistenceManager();
		try {
				if (!containsScoreEntity(scoreentity)) {
					throw new EntityNotFoundException("Object does not exist");
				}
			mgr.makePersistent(scoreentity);
		} finally {
			mgr.close();
		}
		return scoreentity;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeScoreEntity")
	public void removeScoreEntity(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			ScoreEntity scoreentity = mgr.getObjectById(ScoreEntity.class, id);
			mgr.deletePersistent(scoreentity);
		} finally {
			mgr.close();
		}
	}

	private boolean containsScoreEntity(ScoreEntity scoreentity) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(ScoreEntity.class, scoreentity.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}
	
	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listQuestionEntity")
	public CollectionResponse<QuestionEntity> listQuestionEntity(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<QuestionEntity> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(QuestionEntity.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<QuestionEntity>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (QuestionEntity obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<QuestionEntity> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getQuestionEntity")
	public QuestionEntity getQuestionEntity(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		QuestionEntity questionentity = null;
		try {
			questionentity = mgr.getObjectById(QuestionEntity.class, id);
		} finally {
			mgr.close();
		}
		return questionentity;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param questionentity the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertQuestionEntity")
	public QuestionEntity insertQuestionEntity(QuestionEntity questionentity) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsQuestionEntity(questionentity)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(questionentity);
		} finally {
			mgr.close();
		}
		return questionentity;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param questionentity the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateQuestionEntity")
	public QuestionEntity updateQuestionEntity(QuestionEntity questionentity) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsQuestionEntity(questionentity)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(questionentity);
		} finally {
			mgr.close();
		}
		return questionentity;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeQuestionEntity")
	public void removeQuestionEntity(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			QuestionEntity questionentity = mgr.getObjectById(
					QuestionEntity.class, id);
			mgr.deletePersistent(questionentity);
		} finally {
			mgr.close();
		}
	}

	private boolean containsQuestionEntity(QuestionEntity questionentity) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(QuestionEntity.class, questionentity.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
