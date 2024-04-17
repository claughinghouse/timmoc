PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO d1_migrations VALUES(1,'0000_classy_swarm.sql','2024-04-16 22:48:01');
CREATE TABLE `quotes` (
	`id` text NOT NULL,
	`quote_text` text NOT NULL
);
INSERT INTO quotes VALUES('1','this is the first quote');
INSERT INTO quotes VALUES('2','this is the second quote');
INSERT INTO quotes VALUES('3','this is the third quote');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('d1_migrations',1);
