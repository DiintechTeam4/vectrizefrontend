import React, { useState, useEffect } from 'react';
import { FaSpider, FaGlobe, FaDownload, FaTrash, FaEye, FaSearch, FaCog } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const WebScraper = () => {
  const [scrapedData, setScrapedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  // Form states
  const [scrapeForm, setScrapeForm] = useState({
    url: '',
    type: 'single' // single or crawl
  });
  const [crawlForm, setCrawlForm] = useState({
    url: '',
    limit: 10
  });

  // Load scraped data
  const loadScrapedData = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/scrapper/data?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setScrapedData(data.data);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.currentPage);
      } else {
        setError('Failed to load scraped data');
      }
    } catch (err) {
      setError('Error loading scraped data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScrapedData();
  }, []);

  // Scrape single URL
  const handleScrapeSingle = async (e) => {
    e.preventDefault();
    if (!scrapeForm.url) {
      setError('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`${API_BASE_URL}/scrapper/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: scrapeForm.url }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('URL scraped successfully!');
        setScrapeForm({ url: '', type: 'single' });
        loadScrapedData(); // Reload data
      } else {
        setError(data.error || 'Scraping failed');
      }
    } catch (err) {
      setError('Error scraping URL: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crawl website
  const handleCrawlWebsite = async (e) => {
    e.preventDefault();
    if (!crawlForm.url) {
      setError('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`${API_BASE_URL}/scrapper/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: crawlForm.url, 
          limit: parseInt(crawlForm.limit) 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Successfully crawled ${data.data.length} pages!`);
        setCrawlForm({ url: '', limit: 10 });
        loadScrapedData(); // Reload data
      } else {
        setError(data.error || 'Crawling failed');
      }
    } catch (err) {
      setError('Error crawling website: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete scraped data
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scraped data?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/scrapper/data/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Data deleted successfully!');
        loadScrapedData(); // Reload data
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (err) {
      setError('Error deleting data: ' + err.message);
    }
  };

  // View scraped data details
  const handleView = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/scrapper/data/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedData(data.data);
        setShowModal(true);
      } else {
        setError(data.error || 'Failed to load data');
      }
    } catch (err) {
      setError('Error loading data: ' + err.message);
    }
  };

  // View markdown content
  const handleViewMarkdown = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/scrapper/data/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setMarkdownContent(data.data.markdown || 'No markdown content available');
        setShowMarkdownModal(true);
      } else {
        setError(data.error || 'Failed to load markdown');
      }
    } catch (err) {
      setError('Error loading markdown: ' + err.message);
    }
  };

  // Filter scraped data
  const filteredData = scrapedData.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-50 rounded-lg p-2">
            <FaSpider className="text-red-600 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Web Scraper</h2>
            <p className="text-gray-600">Scrape and crawl websites to extract content</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}
      </div>

      {/* Scraping Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single URL Scraping */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaGlobe className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Scrape Single URL</h3>
          </div>
          
          <form onSubmit={handleScrapeSingle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={scrapeForm.url}
                onChange={(e) => setScrapeForm({ ...scrapeForm, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FaSpider className="animate-spin" />
              ) : (
                <FaDownload />
              )}
              <span>{loading ? 'Scraping...' : 'Scrape URL'}</span>
            </button>
          </form>
        </div>

        {/* Website Crawling */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaCog className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Crawl Website</h3>
          </div>
          
          <form onSubmit={handleCrawlWebsite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={crawlForm.url}
                onChange={(e) => setCrawlForm({ ...crawlForm, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Limit
              </label>
              <input
                type="number"
                value={crawlForm.limit}
                onChange={(e) => setCrawlForm({ ...crawlForm, limit: e.target.value })}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <FaSpider className="animate-spin" />
              ) : (
                <FaCog />
              )}
              <span>{loading ? 'Crawling...' : 'Crawl Website'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Scraped Data List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <h3 className="text-xl font-semibold text-gray-800">Scraped Data</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search scraped data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading scraped data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <FaSpider className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">No scraped data found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Markdown Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scraped At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={item._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title || 'No title'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-600 hover:underline flex items-center"
                      >
                        {item.url}
                        <FaGlobe className="ml-1 text-xs" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {item.markdown ? (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border max-h-16 overflow-hidden">
                            {item.markdown.substring(0, 100)}...
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No markdown</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.scrapedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium flex space-x-2">
                      <button
                        onClick={() => handleView(item._id)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {item.markdown && (
                        <button
                          onClick={() => handleViewMarkdown(item._id)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50"
                          title="View Markdown"
                        >
                          <FaSearch />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => loadScrapedData(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => loadScrapedData(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for viewing scraped data */}
      {showModal && selectedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Scraped Data Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedData.title || 'No title'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <a
                    href={selectedData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-red-600 hover:underline"
                  >
                    {selectedData.url}
                  </a>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scraped At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedData.scrapedAt).toLocaleString()}
                  </p>
                </div>
                {selectedData.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedData.metadata.description && (
                        <p><strong>Description:</strong> {selectedData.metadata.description}</p>
                      )}
                      {selectedData.metadata.author && (
                        <p><strong>Author:</strong> {selectedData.metadata.author}</p>
                      )}
                      {selectedData.metadata.keywords && selectedData.metadata.keywords.length > 0 && (
                        <p><strong>Keywords:</strong> {selectedData.metadata.keywords.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">HTML Content Preview</label>
                  <div className="mt-1 text-sm text-gray-900 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {selectedData.content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedData.content.substring(0, 500) + '...' }} />
                    ) : (
                      <p>No HTML content available</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Markdown Content</label>
                  <div className="mt-1 text-sm text-gray-900 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50 font-mono whitespace-pre-wrap">
                    {selectedData.markdown ? (
                      selectedData.markdown
                    ) : (
                      <p className="text-gray-500 italic">No markdown content available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markdown Modal */}
      {showMarkdownModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Markdown Content</h3>
                <button
                  onClick={() => setShowMarkdownModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
                  {markdownContent}
                </pre>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowMarkdownModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebScraper;

