"""
Partial-Sigmoid Neural Network (PSNN) for Merger Success Prediction
Based on: Bi & Zhang (2021) - "Forecasting mergers and acquisitions failure 
based on partial-sigmoid neural network and feature selection"
PLoS One
"""

import numpy as np
from typing import List, Tuple, Dict
import json


class PartialSigmoidNN:
    """
    Partial-Sigmoid Neural Network for imbalanced binary classification
    Addresses the 82% success rate imbalance in M&A predictions
    """
    
    def __init__(self, input_size: int = 16, hidden_size: int = 32, n_bias: float = 10.0):
        """
        Initialize PSNN
        
        Args:
            input_size: Number of input features (default 16 from Chi2 selection)
            hidden_size: Number of hidden neurons
            n_bias: Bias parameter for partial-sigmoid (n > 1, default 10)
        """
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.n_bias = n_bias
        
        # Initialize weights with Xavier initialization
        self.W1 = np.random.randn(input_size, hidden_size) * np.sqrt(2.0 / input_size)
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, 1) * np.sqrt(2.0 / hidden_size)
        self.b2 = np.zeros((1, 1))
        
        # Feature statistics for standardization
        self.feature_mean = None
        self.feature_std = None
    
    def partial_sigmoid(self, x: np.ndarray) -> np.ndarray:
        """
        Partial-sigmoid activation function
        Formula: 1 / (1 + n * e^(-x)) where n > 1
        
        This biases the network toward predicting failures (minority class)
        """
        return 1.0 / (1.0 + self.n_bias * np.exp(-np.clip(x, -500, 500)))
    
    def partial_sigmoid_derivative(self, x: np.ndarray) -> np.ndarray:
        """Derivative of partial-sigmoid for backpropagation"""
        ps = self.partial_sigmoid(x)
        return ps * (1 - ps) * self.n_bias
    
    def sigmoid(self, x: np.ndarray) -> np.ndarray:
        """Standard sigmoid for hidden layer"""
        return 1.0 / (1.0 + np.exp(-np.clip(x, -500, 500)))
    
    def sigmoid_derivative(self, x: np.ndarray) -> np.ndarray:
        """Derivative of sigmoid"""
        s = self.sigmoid(x)
        return s * (1 - s)
    
    def standardize(self, X: np.ndarray, fit: bool = False) -> np.ndarray:
        """
        Standardize features: X' = (X - μ) / σ
        
        Args:
            X: Input features
            fit: If True, compute mean and std from X
        """
        if fit:
            self.feature_mean = np.mean(X, axis=0)
            self.feature_std = np.std(X, axis=0) + 1e-8  # Avoid division by zero
        
        return (X - self.feature_mean) / self.feature_std
    
    def forward(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Forward propagation
        
        Returns:
            z1: Hidden layer pre-activation
            a1: Hidden layer activation
            z2: Output layer pre-activation
            a2: Output (prediction)
        """
        z1 = np.dot(X, self.W1) + self.b1
        a1 = self.sigmoid(z1)
        z2 = np.dot(a1, self.W2) + self.b2
        a2 = self.partial_sigmoid(z2)
        
        return z1, a1, z2, a2
    
    def backward(self, X: np.ndarray, y: np.ndarray, z1: np.ndarray, 
                 a1: np.ndarray, z2: np.ndarray, a2: np.ndarray, 
                 learning_rate: float = 0.01) -> float:
        """
        Backpropagation with MSE loss
        Loss: E = 0.5 * (y - ŷ)^2
        """
        m = X.shape[0]
        
        # Output layer gradients
        dz2 = (a2 - y) * self.partial_sigmoid_derivative(z2)
        dW2 = np.dot(a1.T, dz2) / m
        db2 = np.sum(dz2, axis=0, keepdims=True) / m
        
        # Hidden layer gradients
        dz1 = np.dot(dz2, self.W2.T) * self.sigmoid_derivative(z1)
        dW1 = np.dot(X.T, dz1) / m
        db1 = np.sum(dz1, axis=0, keepdims=True) / m
        
        # Update weights
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2
        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1
        
        # Calculate MSE loss
        loss = np.mean(0.5 * (y - a2) ** 2)
        return loss
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 1000, 
              learning_rate: float = 0.01, verbose: bool = True) -> List[float]:
        """
        Train the PSNN model
        
        Args:
            X: Training features (n_samples, n_features)
            y: Training labels (n_samples, 1) - 1 for success, 0 for failure
            epochs: Number of training epochs
            learning_rate: Learning rate
            verbose: Print training progress
        
        Returns:
            List of losses per epoch
        """
        # Standardize features
        X_std = self.standardize(X, fit=True)
        
        losses = []
        for epoch in range(epochs):
            # Forward pass
            z1, a1, z2, a2 = self.forward(X_std)
            
            # Backward pass
            loss = self.backward(X_std, y, z1, a1, z2, a2, learning_rate)
            losses.append(loss)
            
            if verbose and (epoch + 1) % 100 == 0:
                accuracy = np.mean((a2 > 0.5) == y)
                print(f"Epoch {epoch + 1}/{epochs} - Loss: {loss:.4f} - Accuracy: {accuracy:.4f}")
        
        return losses
    
    def predict(self, X: np.ndarray, threshold: float = 0.5) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict merger success
        
        Args:
            X: Input features
            threshold: Classification threshold (default 0.5)
        
        Returns:
            predictions: Binary predictions (1=success, 0=failure)
            probabilities: Success probabilities
        """
        X_std = self.standardize(X, fit=False)
        _, _, _, probabilities = self.forward(X_std)
        predictions = (probabilities > threshold).astype(int)
        
        return predictions, probabilities
    
    def save_model(self, filepath: str):
        """Save model weights and parameters"""
        model_data = {
            'W1': self.W1.tolist(),
            'b1': self.b1.tolist(),
            'W2': self.W2.tolist(),
            'b2': self.b2.tolist(),
            'feature_mean': self.feature_mean.tolist() if self.feature_mean is not None else None,
            'feature_std': self.feature_std.tolist() if self.feature_std is not None else None,
            'n_bias': self.n_bias,
            'input_size': self.input_size,
            'hidden_size': self.hidden_size
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_data, f)
    
    def load_model(self, filepath: str):
        """Load model weights and parameters"""
        with open(filepath, 'r') as f:
            model_data = json.load(f)
        
        self.W1 = np.array(model_data['W1'])
        self.b1 = np.array(model_data['b1'])
        self.W2 = np.array(model_data['W2'])
        self.b2 = np.array(model_data['b2'])
        self.feature_mean = np.array(model_data['feature_mean']) if model_data['feature_mean'] else None
        self.feature_std = np.array(model_data['feature_std']) if model_data['feature_std'] else None
        self.n_bias = model_data['n_bias']
        self.input_size = model_data['input_size']
        self.hidden_size = model_data['hidden_size']
