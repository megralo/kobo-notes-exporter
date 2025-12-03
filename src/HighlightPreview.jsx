import React, { useState, useEffect } from 'react';

export const HighlightPreview = ({ title, content, onExport }) => {
	const [searchHighlight, setSearchHighlight] = useState('');
	const [filteredContent, setFilteredContent] = useState(content);

	// Aggiorna il contenuto filtrato quando cambia il contenuto originale o la ricerca
	useEffect(() => {
		if (!searchHighlight) {
			setFilteredContent(content);
			return;
		}

		// Se non c'è contenuto o è un messaggio di nessuna evidenziazione, non filtriamo
		if (!content || content === 'Nessuna evidenziazione trovata per questo libro.') {
			setFilteredContent(content);
			return;
		}

		// Dividi il contenuto in sezioni separate dalle linee "---"
		const sections = content.split('---\n\n');

		// Filtra le sezioni che contengono il termine di ricerca (case insensitive)
		const matchingSections = sections.filter(section =>
			section.toLowerCase().includes(searchHighlight.toLowerCase())
		);

		// Ricomponi il contenuto filtrato
		if (matchingSections.length > 0) {
			setFilteredContent(matchingSections.join('---\n\n'));
		} else {
			setFilteredContent(`Nessun risultato trovato per "${searchHighlight}"`);
		}
	}, [content, searchHighlight]);

	// Funzione per evidenziare i termini di ricerca nel testo
	const highlightSearchTerm = (text, searchTerm) => {
		if (!searchTerm || !text) return text;

		// Escape dei caratteri speciali regex
		const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

		// Dividi il testo in righe per preservare la formattazione
		const lines = text.split('\n');

		return lines.map((line, lineIndex) => {
			const parts = line.split(regex);

			const highlightedLine = parts.map((part, partIndex) => {
				// Verifica se questa parte corrisponde al termine di ricerca (case insensitive)
				if (part.toLowerCase() === searchTerm.toLowerCase()) {
					return (
						<span
							key={partIndex}
							className="bg-yellow-300 dark:bg-yellow-600 dark:text-gray-900 px-1 rounded"
						>
							{part}
						</span>
					);
				}
				return part;
			});

			return (
				<React.Fragment key={lineIndex}>
					{highlightedLine}
					{lineIndex < lines.length - 1 && '\n'}
				</React.Fragment>
			);
		});
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
			<div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
				<h2 className="font-bold truncate">{title || 'Anteprima note'}</h2>

				<div className="flex items-center gap-2">
					{/* Barra di ricerca per le note */}
					<div className="relative">
						<input
							type="text"
							placeholder="Cerca nelle note..."
							className="py-1 px-3 pr-8 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
							value={searchHighlight}
							onChange={(e) => setSearchHighlight(e.target.value)}
						/>
						{searchHighlight ? (
							<button
								onClick={() => setSearchHighlight('')}
								className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
								aria-label="Cancella ricerca"
							>
								✕
							</button>
						) : (
							<span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
						)}
					</div>

					{/* Pulsante di esportazione */}
					{content && content !== 'Nessuna evidenziazione trovata per questo libro.' && (
						<button
							onClick={onExport}
							className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
						>
							Esporta note
						</button>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				{filteredContent ? (
					<pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
						{searchHighlight ?
							highlightSearchTerm(filteredContent, searchHighlight) :
							filteredContent
						}
					</pre>
				) : (
					<div className="text-center text-gray-500 dark:text-gray-400 mt-10">
						Seleziona un libro per visualizzare le note
					</div>
				)}
			</div>
		</div>
	);
};