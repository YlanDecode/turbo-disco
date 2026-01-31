import React, { useState, useCallback } from 'react';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useUploadProjectFile, useListProjectFiles, useDeleteProjectFile, useDownloadProjectFile } from '@/api/hooks/useRAG';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, Trash2, Download } from 'lucide-react';
import { formatFileSize, isValidFileExtension } from '@/lib/helpers';
import { toast } from 'sonner';

const VALID_EXTENSIONS = ['pdf', 'txt', 'md'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const RAGPage: React.FC = () => {
  const { projectId, isAuthenticated } = useProjectContext();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useUploadProjectFile();
  const deleteFile = useDeleteProjectFile();
  const downloadFile = useDownloadProjectFile();
  const { data: filesData, isLoading: filesLoading } = useListProjectFiles(projectId || '');

  const handleDelete = async (filename: string) => {
    if (!projectId) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${filename}" ?`)) return;

    try {
      await deleteFile.mutateAsync({ projectId, filename });
      toast.success(`${filename} supprimé avec succès`);
    } catch {
      toast.error(`Erreur lors de la suppression de ${filename}`);
    }
  };

  const handleDownload = async (filename: string) => {
    if (!projectId) return;

    try {
      await downloadFile.mutateAsync({ projectId, filename });
    } catch {
      toast.error(`Erreur lors du téléchargement de ${filename}`);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (!isValidFileExtension(file.name, VALID_EXTENSIONS)) {
      toast.error(`Extension non supportée. Formats acceptés: ${VALID_EXTENSIONS.join(', ')}`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Fichier trop volumineux. Taille maximum: ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }
    return true;
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !projectId) return;

    const file = files[0];
    if (!validateFile(file)) return;

    setUploading(true);
    try {
      await uploadFile.mutateAsync({ projectId, file });
      toast.success(`${file.name} uploadé avec succès`);
    } catch (error) {
      toast.error(`Erreur lors de l'upload de ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  }, [projectId]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Sélectionnez un projet pour gérer les documents RAG
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion RAG</h1>
          <p className="text-muted-foreground">
            Uploadez des documents pour enrichir les réponses de l'assistant
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload de fichiers</CardTitle>
            <CardDescription>
              Formats supportés: PDF, TXT, MD (max {formatFileSize(MAX_FILE_SIZE)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p>Upload en cours...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    Glissez-déposez un fichier ici
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">ou</p>
                  <Button
                    onClick={() => document.getElementById('file-input')?.click()}
                    disabled={uploading}
                  >
                    Sélectionner un fichier
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={(e) => handleUpload(e.target.files)}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fichiers ingérés</CardTitle>
            <CardDescription>
              {filesData?.files.length || 0} fichier(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filesData && filesData.files.length > 0 ? (
              <div className="space-y-2">
                {filesData.files.map((file) => (
                  <div
                    key={file.id || file.filename}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size_bytes)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file.filename)}
                        disabled={downloadFile.isPending}
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.filename)}
                        disabled={deleteFile.isPending}
                        title="Supprimer"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun fichier ingéré
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
